const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@sms/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
