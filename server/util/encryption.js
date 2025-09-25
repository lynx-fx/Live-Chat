const crypto = require("crypto");

exports.encryptMessage = (message, key) => {
  const iv = crypto.randomBytes(12);
  const keyBuffer = Buffer.from(key, "hex");

  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

  const encrypted = Buffer.concat([
    cipher.update(message, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    ciphertext: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
};

exports.decryptMessage = (encryptMessage, key) => {
  const { iv, ciphertext, tag } = encryptMessage;
  const keyBuffer = Buffer.from(key, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};
