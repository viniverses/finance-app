/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pluggy-sdk"],
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
