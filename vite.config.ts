/// <reference types="vitest" />
import path from "path";
import type { BuildOptions } from "vite";
import { defineConfig } from "vite";

const isDemo = process.env.BUILD_DEMO === "true";
const isProd = process.env.NODE_ENV === "production";

function getBase() {
  if (isDemo) {
    // GitHub Pages用はproduction時のみ
    return isProd ? "/uwu-matrix/" : "/";
  }
  return "./";
}

function getRoot() {
  return isDemo ? path.resolve(__dirname, "demo") : undefined;
}

function getBuildConfig(): BuildOptions {
  if (isDemo) {
    return {
      outDir: "./build/demo",
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "demo/index.html"),
          demo1: path.resolve(__dirname, "demo/p1/index.html"),
          demo2: path.resolve(__dirname, "demo/p2/index.html"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name].[ext]",
          dir: "./build/demo",
        },
      },
    };
  }
  return {
    outDir: "./build/dist",
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.ts"),
        f64Mat: path.resolve(__dirname, "src/f64Mat.ts"),
        f32Mat: path.resolve(__dirname, "src/f32Mat.ts"),
        mat4: path.resolve(__dirname, "src/mat4.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
        dir: "./build/dist",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      preserveEntrySignatures: "strict",
    },
  }
}

export default defineConfig({
  root: getRoot(),
  base: getBase(),
  build: getBuildConfig(),
  test: {
    watch: false,
    setupFiles: "test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@@": path.resolve(__dirname),
    },
  },
});