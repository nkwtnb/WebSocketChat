## 概要
WebSocket関連のライブラリを使用せずに作成したチャットアプリケーション。  
また、文字列のエンコーディング変換に関しても、可能な限り手動実装を行なった。

## 目的
- リアルタイムチャットの実装をWebで調べると、firebase realtime database を使用したものが多く、ライブラリや外部プラットフォーム等に依存せずに、リアルタイムのやり取りを行う方法に興味があった為。
- あまり馴染みが無かった、WebSocket周りの知識を深める為

---

# A websocket-chat-without-library

This is a websocket-chat created without third-party libraries.

## Scripts - frontend

based on Create React App 's scripts

## Scripts - server

### `npm run build`

compile sources (TypeScript)

### `npm run start`

launch server on frontend

### `npm run dev`

compile sources (TypeScript) and launch server

## Reference

- https://triple-underscore.github.io/RFC6455-ja.html  
  RFC of WebSocket Protocol

- https://developer.mozilla.org/ja/docs/Web/API/WebSockets_API/Writing_WebSocket_servers  
  document of writing websocket server

- https://gist.github.com/Jxck/3171239  
  websocket server with simply implements

- https://blog.ojisan.io/rust-websocket/  
  websocket server implemented in Rust

- https://qiita.com/yasushi-jp/items/b006f7170ef3a86de09f  
- https://www.tohoho-web.com/ex/charset.html#utf-8  
  explanation of how to convert from unicode to utf-8 or utf-16
