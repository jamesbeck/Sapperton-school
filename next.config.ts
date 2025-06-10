import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-west-1.wasabisys.com",
        port: "",
        pathname: "/sapperton/**",
      },
    ],
  },
};

export default withPayload(nextConfig);
