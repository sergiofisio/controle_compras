import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["typeorm", "pg", "bcryptjs", "tesseract.js"],
  allowedDevOrigins: ["192.168.15.2", "192.168.15.12"],
};

export default nextConfig;
