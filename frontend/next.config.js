/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa');

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true
});

const nextConfig = {
  eslint: {
    // Desativar completamente o ESLint durante o build
    ignoreDuringBuilds: true
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true
  },
  // Configuração de proxy para redirecionar requisições de API para o backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*"
      }
    ];
  }
};

module.exports = pwaConfig(nextConfig);
