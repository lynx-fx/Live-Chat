const crypto = require("crypto");

exports.encryptMessage = (message, key) => {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(message, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    ciphertext: this.encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
};

exports.decryptMessage = (encryptMessage, key) => {
  const { iv, ciphertext, tag } = encryptMessage;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};
