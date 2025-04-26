/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desativar completamente o ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
