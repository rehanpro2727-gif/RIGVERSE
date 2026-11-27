/** @type {import('next').NextConfig} */
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