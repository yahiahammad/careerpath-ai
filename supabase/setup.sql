-- 1. Enable pgvector extension to work with embeddings
create extension if not exists vector;


-- 2. Add the embedding column to your courses table
-- We use 384 dimensions for the 'all-MiniLM-L6-v2' model (cost-effective/free local model).
-- If you choose OpenAI 'text-embedding-3-small', change 384 to 1536.
alter table courses 
add column if not exists embedding vector(384);

-- 3. Create an index for faster similarity search
-- ivfflat is good for speed, but requires some data to be present for optimal index creation.
-- accessing the data via vector ops.
create index on courses using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. Create the RPC function to find similar courses
-- Drop first to allow return type change
drop function if exists match_courses(vector, float, int);

create or replace function match_courses (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  provider text,
  url text,
  difficulty_level text,
  duration_hours bigint,
  rating real,
  user_count bigint,
  skills text[],
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    courses.id,
    courses.title::text,
    courses.description::text,
    courses.provider::text,
    courses.url::text,
    courses.difficulty_level::text,
    courses.duration_hours,
    courses.rating,
    courses.user_count,
    array(
        select s.name::text
        from course_skills cs
        join skills s on s.id = cs.skill_id
        where cs.course_id = courses.id
        limit 5 
    ) as skills,
    1 - (courses.embedding <=> query_embedding) as similarity
  from courses
  where 1 - (courses.embedding <=> query_embedding) > match_threshold
  order by courses.embedding <=> query_embedding
  limit match_count;
end;
$$;
