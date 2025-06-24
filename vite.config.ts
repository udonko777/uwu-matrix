/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const getPackageName = () => packageJson.name;

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, char => char[1].toUpperCase());
  } catch {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `${getPackageName()}.js`,
  iife: `${getPackageName()}.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;
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

function getBuildConfig() {
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
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats,
      fileName: format => fileName[format],
    },
  };
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