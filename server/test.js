const decoder = new TextDecoder("utf-8", {fatal: true});

const buffer = new Uint8Array(
[
  227,129,130,
  240, 160, 128, 139,
  240, 160, 128, 139,
  240, 160, 128, 139,
]
);

const text = decoder.decode(buffer);
console.log(text);
