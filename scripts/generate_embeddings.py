import os
from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env file

from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# --- CONFIGURATION ---
# Ensure you have these environment variables set or replace them with your keys
# Initialize Supabase
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url:
    raise ValueError("Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env")
if not key:
    raise ValueError("Missing Supabase Key. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env")

supabase: Client = create_client(url, key)

# Initialize Model (Free, local, fast, 384 dims)
print("Loading model...")
model = SentenceTransformer('all-MiniLM-L6-v2')



def update_courses_batch(updates):
    # upsert matches on id
    if not updates:
        return
    results = supabase.table('courses').upsert(updates).execute()
    return results

def main():
    BATCH_SIZE = 50 # Reduced batch size for safety during long runs
    
    print("Starting full dataset processing...")
    print("This script picks up courses that don't have embeddings yet.")
    print("You can stop (Ctrl+C) and resume this script at any time.")
    
    processed_count = 0
    
    while True:
        # Fetch courses that don't have embeddings yet
        # We don't need a range offset because as we fill them, they drop out of this query
        response = supabase.table('courses').select("id, title, description").is_("embedding", "null").limit(BATCH_SIZE).execute()
        courses = response.data
        
        if not courses:
            print("No more courses found without embeddings. Done!")
            break
            
        updates = []
        texts = []
        ids = []
        
        # Prepare texts
        for course in courses:
            text = f"{course.get('title', '')} {course.get('description', '')}"
            texts.append(text)
            ids.append(course['id'])
            
        # Generate embeddings
        try:
            embeddings = model.encode(texts)
            
            # Prepare updates
            for i, emp in enumerate(embeddings):
                updates.append({
                    "id": ids[i],
                    "embedding": emp.tolist()
                })
                
            # Update Supabase
            update_courses_batch(updates)
            
            processed_count += len(courses)
            print(f"Processed {processed_count} courses...", end='\r')
            
        except Exception as e:
            print(f"\nError processing batch: {e}")
            # If we error, we might want to skip or simple retry. 
            # For now, let's break to avoid spamming errors if DB is down.
            break

if __name__ == "__main__":
    main()
