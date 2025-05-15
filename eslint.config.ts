import eslint from "@eslint/js";
import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      "**/.history",
      "**/.husky",
      "**/.vscode",
      "**/coverage",
      "**/dist",
      "**/node_modules",
    ],
  },
  {
    plugins: {
      typescriptEslint: tseslint.plugin,
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
    },
    rules: {
      // 1 エディタのデフォルトのフォーマッターと上手く連携が出来ず、警告が出るたびに手動での調整が必要だった
      // 2 行列を配列で表現する際、どうしても独自のフォーマットを使いたい (特にテストデータ)
      // 3 そもそもこのプロジェクトのコードはおそらく私一人しか見ない
      // という理由でprettierを無効化しました。
      "prettier/prettier": "off",
    },
  },
] satisfies Linter.Config[];
