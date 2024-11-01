/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1'],  // DjangoサーバーのIPを許可
  },
};

export default nextConfig;