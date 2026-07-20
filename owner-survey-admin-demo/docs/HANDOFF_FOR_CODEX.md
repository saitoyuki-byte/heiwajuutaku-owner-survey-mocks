# Codex引き継ぎメモ

## 前提

平和住宅情報センター様では、創業50周年記念既存オーナーアンケートがフォームからGoogleスプレッドシートへ回答蓄積される形で稼働中。
ただし、スタッフにスプレッドシート編集権限を渡したことで、シート構造が壊れる事象が発生した。

## 今回作るもの

既存フォームとは別に、アンケート回答を確認し、スタッフコメントを追加できる管理ダッシュボードを作る。
スタッフはスプレッドシートを直接開かず、Web画面からだけ閲覧とコメント登録を行う。

## デモ

`index.html` は打ち合わせ用の静的モック。
本番データ連携は未実装。

## 本番実装の想定

Google Apps Script Webアプリで実装する。

- `Code.gs`
  - 回答取得
  - コメント保存
  - ステータス更新
  - 更新履歴保存
  - メール通知
- `Index.html`
  - ダッシュボード画面
- `Styles.html`
  - 画面スタイル
- `Client.html`
  - フロント側JavaScript

## シート構成案

- `RawResponses`
  - フォーム回答の元データ
- `StaffComments`
  - `responseId`
  - `status`
  - `assignee`
  - `comment`
  - `updatedBy`
  - `updatedAt`
- `AuditLog`
  - `responseId`
  - `action`
  - `before`
  - `after`
  - `updatedBy`
  - `updatedAt`
- `Settings`
  - 通知先メール
  - スタッフ一覧
  - ステータス一覧

## Codexに依頼するときのプロンプト例

以下の静的モックをベースに、Google Apps Script Webアプリとして本番化してください。
既存のフォーム回答シートをRawResponsesとして読み込み、スタッフコメントと対応状況はStaffCommentsに保存してください。
スタッフにはスプレッドシート編集権限を渡さず、Webアプリ上で回答確認とコメント追加ができるようにしてください。
誰がいつコメントしたかをAuditLogにも記録し、必要に応じて指定メールアドレスへ通知できる構成にしてください。
