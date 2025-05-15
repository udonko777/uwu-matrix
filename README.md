# 🌸 uwu-matrix 💫

> a smol matrix library for your big brain math uwu

---

## 🧠 このプロジェクトってなに？ (What is this?)

このプロジェクトは行列演算への理解を深めることを目的として作成されました。

実用的なライブラリの作成を目指すものではありません。
学習目的であり、数学的理解を優先して作成します。

## 🎯 めざすこと (Goals)

`WebGL` を利用した CG レンダリングのために、最低限必要な行列演算を提供することを最終目標としています。

簡単のため、パフォーマンス面のチューニングは行わないものとします。ただし、行列演算の理解を深めることを目的としていることから、数学的な手法を用いた演算の効率化は可能なら取り入れてよいものとします。

## 🧩 つかうシーン (Use Cases)

このライブラリは以下のようなシーンを想定しています：

- 🎨 WebGL による 3D レンダリング
- 🎥 カメラ視点の変換や、物体の位置・回転・拡縮の操作

---

## 🧪 実装予定のきのう (Planned Features)

### 🧷 ベクトル (Vector)

- `Vec2` / `Vec3` / `Vec4`
- 加算・減算・スカラー倍
- ドット積・クロス積（Vec3限定）
- 正規化・ノルム

### 🧷 行列 (Matrix)

- `Mat3` / `Mat4`
- 単位行列
- 行列・ベクトルの乗算
- 各種変換行列（平行移動・回転・拡縮）
- 射影行列（透視／正射影）
- ~~逆行列（できたらいいな…）~~

---

## 🐧 デバッグとかビルドとか (How to Run)

Linux 環境推奨です（でも Windows でもがんばれば動くよ）。

```bash
npm install
npm run dev
```

Windows の場合、`package.json` の `dev` スクリプトを以下のように修正してください：

```json
"dev": "cross-env BUILD_DEMO=true vite --host"
```

```bash
npm install --save-dev cross-env
npm run dev
```

その後、`localhost:<port>/` を開いてください！