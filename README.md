# uwu-matrix

日本語のドキュメンテーションコメントが付いた、関数型志向の `WebGL` 向け行列演算ライブラリ

# このプロジェクトについて

このプロジェクトは、私自身の学習目的で作成されました。

- 行列演算を実装することで、行列に対する数学的理解を深める
- `Vite` + `Vitest` , `fast-check` , `GitHub Actions` 等、関連するツールの利用方法の学習
- `npm` パッケージを実際にリリースすることで、その過程にある開発手法を学ぶ

予定していた機能が実装された後は、個人的に `WebGL` を扱う際に利用する事を想定しています。

## プロジェクト目標

`WebGL` を利用した CG レンダリングのために、最低限必要な行列演算を提供することを最終目標としています。

## 想定する利用シーン

このライブラリは以下のようなシーンを想定しています：

- WebGL による 3D レンダリング
- カメラ視点やオブジェクトの位置・回転・拡縮の変換

## 実装予定の機能

以下のベクトル／行列演算を段階的に実装していきます。

### ベクトル関連

- `Vec2` / `Vec3` / `Vec4` の定義
- ベクトルの加算・減算
- スカラー倍
- 内積（ドット積）
- 外積（クロス積、Vec3のみ）
- ベクトルの正規化
- 長さ（ノルム）の計算

### 行列関連

- `Mat3` / `Mat4` の定義
- 単位行列の生成
- 行列同士の乗算
- ベクトルとの乗算
- 平行移動行列（translation matrix）
- 回転行列（rotation matrix）
- 拡大縮小行列（scaling matrix）
- 透視投影行列（perspective projection matrix）
- 正射影行列（orthographic projection matrix）
- 逆行列の計算（dekiruka wakarimasen）

## デバッグ方法

Linuxでのビルドを推奨します。🐧

```bash
npm install
npm run dev
```

`localhost:<port>/` を開くと demo ページが閲覧できます  
 ( ビルドの際、環境変数を設定する必要があるので、 windows 上でビルドする際は、 package.json を編集して、`"dev": "cross-env BUILD_DEMO=true vite --host"` に書き換えてください )
