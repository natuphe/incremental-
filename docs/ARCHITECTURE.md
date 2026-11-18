# アーキテクチャ

## 概要

Vite + React + TypeScript のシングルページアプリ。ゲームロジックは UI から分離し、`src/game/` に純関数として置く。

## ディレクトリ

- `src/game/` — 状態型、コンテンツ定義、数式、エンジン、セーブ、オフライン
- `src/state/` — React コンテキストとティックループ
- `src/components/` — 画面パネル
- `src/utils/` — 表示用フォーマット
- `docs/` — 開発文書

## データフロー

1. `GameProvider` が起動時に localStorage から読込
2. オフライン差分を `applyOfflineProgress` で適用
3. 一定間隔で `applyTick` を実行
4. ユーザー操作はエンジン関数経由で新しい `GameState` を生成
5. 定期的およびページ非表示時にセーブ

## セーブ

- キー: `ashwake.save.v1`
- `migrateSave` で欠損・不正値を吸収
- UI 一時フラグ `justUnlocked` は永続化しない

## テスト方針

- エンジン・数式・セーブ・オフラインを Vitest で検証
- UI の見た目テストは必須としない
