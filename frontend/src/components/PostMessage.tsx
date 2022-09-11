export const PostMessage = () => {
  return (
    <>
      <textarea id="send-message"></textarea>
      <button id="send" disabled>送信</button>
      <button id="toggle-connect">接続</button>
      <ul id="received-message"></ul>
    </>
  )
};
