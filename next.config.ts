/** @type {import('next').NextConfig} */
// TODO: Read all the next js possible config
const nextConfig = {
  experimental: {
    // This enables to do logging after the request is processed
    after: true,
  },
  // Add image domains we'll use
  images: {
    domains: ["lh3.googleusercontent.com"], // For Google Auth profile pictures
  },
};

export default nextConfig;
