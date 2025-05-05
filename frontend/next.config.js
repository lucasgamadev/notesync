/** @type {import('next').NextConfig} */
const withPWA = require("./next-pwa.config");

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

module.exports = withPWA(nextConfig);
