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
      'onnxruntime-node': 'commonjs onnxruntime-node',
    });
    return config;
  },
}

export default nextConfig
