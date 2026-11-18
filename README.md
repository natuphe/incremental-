# ASHWAKE

ブラウザで動く idle / incremental ゲーム。

残熱を起こし、施設と研究で網を復旧していく。進行は自動セーブされ、離席中も上限付きで進む。

## 必要環境

- Node.js 20+
- npm 10+

## セットアップ

```bash
npm install
```

## 起動

```bash
npm run dev
```

デフォルトのローカル URL: `http://localhost:5173/`

## その他コマンド

```bash
npm run build    # 本番ビルド
npm run preview  # ビルド結果のプレビュー
npm test         # ユニットテスト
npm run lint     # ESLint
```

## セーブ

- ブラウザの `localStorage` に自動保存
- 設定画面から JSON の書き出し / 読み込み / 完全リセットが可能

## 開発文書

- `docs/ARCHITECTURE.md` — 構成とデータフロー
- `docs/DEVELOPMENT.md` — 開発手順と規約
- `TASKS.md` — 作業トラッキング（内部）

## デバッグ

通常プレイ UI にデバッグパネルやチート導線は出していない。
