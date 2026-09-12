import { generateRSAKeyPair, clearKeys } from "./clientEncrypt";

const KEY_EXISTS_KEY = "yivad-key-exists";
const PUBLIC_KEY_STORE = "yivad-public-key-stored";

/**
 * Key lifecycle manager for client-side encryption.
 */
export const keyManager = {
  async initialize(): Promise<boolean> {
    const exists = localStorage.getItem(KEY_EXISTS_KEY);
    if (exists) return true;

    try {
      const { publicKey } = await generateRSAKeyPair();
      localStorage.setItem(KEY_EXISTS_KEY, "true");
      localStorage.setItem(PUBLIC_KEY_STORE, JSON.stringify(publicKey));
      return true;
    } catch {
      return false;
    }
  },

  async resetKeys(): Promise<void> {
    await clearKeys();
    localStorage.removeItem(KEY_EXISTS_KEY);
    localStorage.removeItem(PUBLIC_KEY_STORE);
  },

  isInitialized(): boolean {
    return localStorage.getItem(KEY_EXISTS_KEY) === "true";
  },

  getPublicKey(): JsonWebKey | null {
    const raw = localStorage.getItem(PUBLIC_KEY_STORE);
    return raw ? JSON.parse(raw) : null;
  },

  async exportPrivateKey(password: string): Promise<string> {
    // Re-import the stored private key and export as password-encrypted JSON
    const jwk = await new Promise<JsonWebKey>((resolve, reject) => {
      const request = indexedDB.open("yivad-encryption", 1);
      request.onsuccess = () => {
        const tx = request.result.transaction("keys", "readonly");
        const getReq = tx.objectStore("keys").get("yivad-keypair");
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      };
      request.onerror = () => reject(request.error);
    });

    const data = JSON.stringify(jwk);
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const aesKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("yivad-key-export"), iterations: 100000, hash: "SHA-256" },
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
  },
};