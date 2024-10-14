/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io']
  },
  reactStrictMode: true,
  experimental: {
    // Adjust preload behavior
    optimizeCss: true // This might help in optimizing CSS loading
    // You can also disable automatic preloading if needed
    // disableOptimizedLoading: true,
  }
};

module.exports = nextConfig;
