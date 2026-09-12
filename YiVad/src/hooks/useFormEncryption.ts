import { ref } from "vue";

/**
 * Client-side field encryption using Web Crypto API (RSA-OAEP).
 * In production, keys would be managed via a dedicated KMS or server-side key exchange.
 */
export const useFormEncryption = () => {
  const isReady = ref(false);
  const publicKeyRef = ref<CryptoKey | null>(null);
  const privateKeyRef = ref<CryptoKey | null>(null);

  async function generateKeyPair(): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    publicKeyRef.value = keyPair.publicKey;
    privateKeyRef.value = keyPair.privateKey;
    isReady.value = true;

    const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return { publicKey: publicJwk, privateKey: privateJwk };
  }

  async function importPublicKey(jwk: JsonWebKey): Promise<void> {
    publicKeyRef.value = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  }

  async function importPrivateKey(jwk: JsonWebKey): Promise<void> {
    privateKeyRef.value = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );
    isReady.value = true;
  }

  async function encrypt(plaintext: string): Promise<string> {
    if (!publicKeyRef.value) throw new Error("Public key not available");
    const encoded = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKeyRef.value, encoded);
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  async function decrypt(ciphertext: string): Promise<string> {
    if (!privateKeyRef.value) throw new Error("Private key not available");
    const encrypted = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKeyRef.value, encrypted);
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Mask sensitive data for display.
   * e.g., "110101199001011234" → "110101********1234"
   */
  function maskValue(value: string, showStart: number = 6, showEnd: number = 4): string {
    if (!value || value.length <= showStart + showEnd) return value;
    const start = value.slice(0, showStart);
    const end = value.slice(-showEnd);
    const masked = "*".repeat(value.length - showStart - showEnd);
    return `${start}${masked}${end}`;
  }

  /**
   * Export private key as encrypted JSON (password-protected).
   */
  async function exportEncryptedPrivateKey(password: string): Promise<string> {
    if (!privateKeyRef.value) throw new Error("No private key to export");
    const jwk = await crypto.subtle.exportKey("jwk", privateKeyRef.value);
    const data = JSON.stringify(jwk);

    // Encrypt with password-derived key (simple approach)
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const aesKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("yivad-salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, enc.encode(data));
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  return {
    isReady,
    generateKeyPair,
    importPublicKey,
    importPrivateKey,
    encrypt,
    decrypt,
    maskValue,
    exportEncryptedPrivateKey,
  };
};