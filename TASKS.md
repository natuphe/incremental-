# TASKS — ASHWAKE

内部作業用。チャット報告ではネタバレ禁止事項を守る。

## 内部企画（実装用・要約）

- 題材: 冷却した炉心網の残熱を起こし、信号を再接続する idle / incremental
- 技術: Vite + React + TypeScript + Vitest + ESLint
- コア: tick ループ、生産、購入、研究、解放、実績、プレステージ、セーブ、オフライン進行
- UI: ブランド先行のゲームシェル。通常 UI にデバッグ露出なし
- セーブ: localStorage、バージョン付き、オフライン差分適用

## 完了済み作業

- [x] リポジトリ確認・ブランチ作成
- [x] プロジェクト基盤
- [x] ゲームコア（tick / 購入 / 研究 / 覚醒 / 試練 / 実績）
- [x] セーブ・オフライン進行
- [x] UI（運用 / 研究 / 覚醒 / 実績 / 試練 / 設定）
- [x] README / docs
- [x] `npm test` 16 passed
- [x] `npm run build` success
- [x] `npm run lint` clean
- [x] 手動起動確認（Playwright スモーク: 着火・購入・タブ・設定・デバッグ非露出）

## 現在作業中

- [ ] コミット・プッシュ・PR

## 未完了作業

なし（実装完了。Git 反映のみ）

## 直近のテスト結果

`npm test` — 16 passed  
Playwright スモーク — 着火/購入/研究/設定 OK、debug 露出なし

## 直近のビルド結果

`npm run build` — success

## 発生中のエラー

なし

## 変更途中のファイル

なし

## 次に実行する具体的な作業

1. git add / commit / push
2. ManagePullRequest で PR 作成

## 再開時に最初に確認すべき事項

- `npm test` / `npm run build` / `npm run lint`
- `npm run dev` → `http://127.0.0.1:5173/`
