# Personal Linkboard

個人運用向けの Linktree 風リンクまとめアプリです。  
`Next.js + Tailwind CSS + SQLite` の最小構成で、公開ページと管理画面を 1 つのアプリにまとめています。

## Features

- 公開用リンクページ
- 管理画面からプロフィールとリンクを編集
- 単一パスワードでログイン
- リンクの追加、編集、削除
- 表示/非表示の切り替え
- 並び順の変更
- テーマカラー、背景、角丸の調整
- ライブプレビュー
- SEO / OGP / favicon 対応

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- SQLite
- better-sqlite3
- bcryptjs
- lucide-react

## Project Structure

```text
app/
  admin/
  api/
  globals.css
  layout.js
  page.js
components/
  admin-editor.jsx
  public-link-page.jsx
lib/
  auth.js
  db.js
  validators.js
scripts/
  hash-password.mjs
```

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Create env file

```bash
cp .env.example .env
```

### 3. Generate password hash

```bash
npm run db:hash-password -- your-strong-password
```

出力されたハッシュを `.env` の `ADMIN_PASSWORD_HASH` に設定してください。

`.env` の例:

```env
ADMIN_PASSWORD_HASH=$2b$10$replace_with_bcrypt_hash
SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run dev server

```bash
npm run dev
```

アクセス先:

- Public page: `http://localhost:3000`
- Admin page: `http://localhost:3000/admin`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:hash-password -- your-password
```

## Authentication

- 管理画面は単一パスワード認証です
- パスワード本体は保存せず、bcrypt ハッシュのみを環境変数で保持します
- ログイン後は `HttpOnly Cookie` にセッションを保存します

## Database

- ローカル DB は `data.sqlite`
- 初回起動時にプロフィールとサンプルリンクを自動生成します

## Deployment

### Recommended

SQLite のまま運用するなら次が向いています。

- Railway
- Render
- Fly.io

### Note for Vercel

Vercel はローカル SQLite 永続化と相性がよくありません。  
本番で Vercel を使う場合は、`lib/db.js` を `Supabase` や `PostgreSQL` に差し替える構成がおすすめです。

## Design Direction

- シンプル
- 上品
- 現代的
- モバイル優先
- 白 / 黒 / グレー基調 + アクセントカラー

## SEO / OGP

- `app/layout.js` で metadata を生成
- OGP title / description / image を設定
- favicon URL を管理画面から変更可能

## Future Improvements

- ドラッグ&ドロップ並び替え
- OGP 画像自動生成
- アクセス解析
- クリック数の記録
- テーマプリセット
- Supabase / Postgres 対応

## License

Private / personal use.
