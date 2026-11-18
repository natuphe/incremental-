import { useState } from 'react'
import { useGame } from '../state/GameContext'

export function SettingsPanel() {
  const { state, patchSettings, resetAll, exportSave, importSave } = useGame()
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('')

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>設定</h2>
        <p>表示とデータの管理。</p>
      </header>

      <div className="settings-block">
        <label className="settings-row">
          <span>数値表記</span>
          <select
            value={state.settings.numberFormat}
            onChange={(e) =>
              patchSettings({
                numberFormat: e.target.value as 'compact' | 'scientific',
              })
            }
          >
            <option value="compact">コンパクト</option>
            <option value="scientific">指数</option>
          </select>
        </label>

        <label className="settings-row">
          <span>動きを減らす</span>
          <input
            type="checkbox"
            checked={state.settings.reduceMotion}
            onChange={(e) =>
              patchSettings({ reduceMotion: e.target.checked })
            }
          />
        </label>
      </div>

      <div className="settings-block">
        <h3>セーブデータ</h3>
        <div className="settings-actions">
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const text = exportSave()
              try {
                await navigator.clipboard.writeText(text)
                setMessage('セーブをクリップボードへコピーした。')
              } catch {
                setMessage(text)
              }
            }}
          >
            書き出し
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (
                window.confirm(
                  'すべての進行を削除して最初から始める。よろしい？',
                )
              ) {
                resetAll()
                setMessage('データを初期化した。')
              }
            }}
          >
            完全リセット
          </button>
        </div>
        <textarea
          className="import-box"
          placeholder="セーブ JSON を貼り付け"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={4}
        />
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            const ok = importSave(importText.trim())
            setMessage(ok ? '読み込みに成功した。' : '読み込みに失敗した。')
          }}
        >
          読み込み
        </button>
        {message && <p className="hint">{message}</p>}
      </div>
    </section>
  )
}
