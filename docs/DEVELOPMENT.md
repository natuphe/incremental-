# 開発ガイド

## 日常コマンド

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## 規約

- ゲームバランスや名称の変更は `src/game/content.ts` を起点にする
- 進行ロジックは `src/game/engine.ts` / `formulas.ts` に寄せ、コンポーネントへ直接書かない
- 通常 UI にデバッグ用の資源追加・チート・内部 ID 露出を置かない
- チャットや README に中盤以降の攻略ネタバレを書かない

## 作業中断時

`TASKS.md` に完了 / 作業中 / 未完了 / テスト結果 / 次の一手を残す。

## ブランチ

機能作業は `cursor/<name>-1042` 形式のブランチで行う。
