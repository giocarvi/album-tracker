import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Si alguien entra usando el dominio del calendario...
        source: '/',
        has: [
          {
            type: 'host',
            value: 'calendario2026.fullfan.net',
          },
        ],
        // ...lo mandamos "en secreto" a la página del calendario
        destination: '/calendario',
      },
      {
        // Esto cubre cualquier sub-ruta
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'calendario2026.fullfan.net',
          },
        ],
        destination: '/calendario/:path*',
      }
    ];
  },
};

export default nextConfig;