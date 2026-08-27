import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A package.json/lockfile in the
  // parent folder (the prototype scaffolder) otherwise makes Turbopack infer
  // the wrong root and emit a multiple-lockfiles warning.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
