import path from "node:path";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack }) {
    if (process.env.CLOUDFLARE_WORKERS === "true") {
      // Replace before tsconfig path resolution and Next's native-package externalization.
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(/(?:^|\/)photo-image$/, path.resolve("src/lib/photo-image.worker.ts")));
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;

