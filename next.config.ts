import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite mostrar con next/image las fotos públicas que el panel sube a Supabase Storage.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
