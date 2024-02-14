/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aitist-aiwallpaper-test.s3.amazonaws.com",
        port: "",
        pathname: "/wallpapers/**",
      },
    ],
  },
};

module.exports = nextConfig;
