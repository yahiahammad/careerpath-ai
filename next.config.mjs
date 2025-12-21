/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals.push({
      '@xenova/transformers': 'commonjs @xenova/transformers',
      'sharp': 'commonjs sharp',
    });
    return config;
  },
}

export default nextConfig
