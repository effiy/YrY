/**
 * Client-side encryption utilities using Web Crypto API.
 */

const KEY_PAIR_STORE = "yivad-keypair";
const PUBLIC_KEY_STORE = "yivad-public-key";

export async function generateRSAKeyPair(): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> {
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

  const [publicJwk, privateJwk] = await Promise.all([
    crypto.subtle.exportKey("jwk", keyPair.publicKey),
    crypto.subtle.exportKey("jwk", keyPair.privateKey),
  ]);

  // Store private key in IndexedDB
  await storeKey(KEY_PAIR_STORE, privateJwk);
  await storeKey(PUBLIC_KEY_STORE, publicJwk);

  return { publicKey: publicJwk, privateKey: privateJwk };
}

export async function encryptWithPublicKey(plaintext: string, publicJwk?: JsonWebKey | null): Promise<string> {
  let jwk: JsonWebKey | null | undefined = publicJwk;
  if (!jwk) {
    jwk = await getStoredKey(PUBLIC_KEY_STORE);
  }
  if (!jwk) throw new Error("Public key not found");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptWithPrivateKey(ciphertext: string): Promise<string> {
  const jwk = await getStoredKey(KEY_PAIR_STORE);
  if (!jwk) throw new Error("Private key not found");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
  const encrypted = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

async function storeKey(storeName: string, jwk: JsonWebKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("yivad-encryption", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("keys")) {
        request.result.createObjectStore("keys");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      tx.objectStore("keys").put(jwk, storeName);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getStoredKey(storeName: string): Promise<JsonWebKey | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("yivad-encryption", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("keys")) {
        request.result.createObjectStore("keys");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readonly");
      const getRequest = tx.objectStore("keys").get(storeName);
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearKeys(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("yivad-encryption", 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      tx.objectStore("keys").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}