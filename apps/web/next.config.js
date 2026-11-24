/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The @shared/* alias points at ../../shared/src, outside this app's folder.
  // externalDir lets Next compile TypeScript from there.
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
