/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

const getPackageName = () => {
  return packageJson.name;
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, char => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `${getPackageName()}.js`,
  iife: `${getPackageName()}.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;
const isDemo = process.env.BUILD_DEMO === "true";

export default defineConfig({
  base: "/",
  build: isDemo
    ? {
        outDir: "./build/demo",
        rollupOptions: {
          input: path.resolve(__dirname, "demo/index.html"),
        },
      }
    : {
        outDir: "./build/dist",
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          name: getPackageNameCamelCase(),
          formats,
          fileName: format => fileName[format],
        },
      },
  test: {
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@@": path.resolve(__dirname),
    },
  },
});
