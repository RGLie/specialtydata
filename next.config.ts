import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 정적 파일로 export
  distDir: 'out',    // 빌드 출력 디렉토리
  trailingSlash: true,
  images: {
    unoptimized: true  // static export에서 이미지 최적화 비활성화
  }
};

export default nextConfig;
