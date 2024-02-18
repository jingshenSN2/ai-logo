/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aitist-ailogo-bucket.s3.amazonaws.com",
        port: "",
        pathname: "/logos/**",
      },
    ],
  },
};

module.exports = nextConfig;
