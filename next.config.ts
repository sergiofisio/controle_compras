import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["typeorm", "pg", "bcryptjs", "tesseract.js"],
  allowedDevOrigins: ["192.168.15.2","http://192.168.15.2:3000", "localhost", "127.0.0.1", "simultaneously-bracelets-missing-specials.trycloudflare.com"],
};

export default nextConfig;
