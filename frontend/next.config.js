/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar ESLint durante o build para evitar que falhe por causa de warnings
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
