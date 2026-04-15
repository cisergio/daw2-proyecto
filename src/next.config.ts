import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para permitir conectar a través de IP de red local (LAN / Radmin / Hamachi)
  allowedDevOrigins: ['192.168.5.2', '26.175.75.26','192.168.5.4'],
};

export default nextConfig;
