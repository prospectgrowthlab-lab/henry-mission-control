/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only process usage-parser on server side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/usage-parser': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
