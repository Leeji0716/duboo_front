import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // 클라이언트에서 요청하는 API 경로
        destination: 'http://localhost:8088/api/:path*', // 실제 서버의 API 주소
      },
    ]
  },
};

export default nextConfig;