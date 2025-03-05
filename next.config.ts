import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'v3.fal.media',  // Fal.AI image domain
      'placehold.co',  // For fallback placeholder images
      'res.cloudinary.com', // For potential future use
    ],
  },
};

export default nextConfig;
