/** @type {import('next').NextConfig} */
<<<<<<< HEAD
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Resolve @/* and @shared/* aliases for webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@api': path.resolve(__dirname, '../api/src'),
      '@shared': path.resolve(__dirname, '../../shared/src'),
    };
    return config;
  },
};

module.exports = nextConfig;
=======
const nextConfig = {
  reactStrictMode: true,
  // The @shared/* alias points at ../../shared/src, outside this app's folder.
  // externalDir lets Next compile TypeScript from there.
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
