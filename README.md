## 概要
WebSocket関連のライブラリを使用せずに作成したチャットアプリケーション。  
また、文字列のエンコーディング変換に関しても、可能な限り手動実装を行なった。

## 目的
- リアルタイムチャットの実装をWebで調べると、firebase realtime database を使用したものが多く、ライブラリや外部プラットフォーム等に依存せずに、リアルタイムのやり取りを行う方法に興味があった為。
- あまり馴染みが無かった、WebSocket周りの知識を深める為

---

# A websocket-chat-without-library

This is a websocket-chat created without third-party libraries.

## Scripts - client

based on Create React App 's scripts

## Scripts - server

### `npm run build`

compile sources (TypeScript)

### `npm run start`

launch server

### `npm run dev`

compile sources (TypeScript) and launch server
