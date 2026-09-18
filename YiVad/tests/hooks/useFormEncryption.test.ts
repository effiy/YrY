/**
 * useFormEncryption — 客户端 RSA 字段加密
 *
 * ## 场景
 * 敏感表单字段（身份证号、银行卡号、健康信息）在浏览器端使用 RSA-OAEP 加密后传输，
 * 后端零知识存储。私钥可由用户密码保护的 AES-GCM 加密导出。
 *
 * ## 效果演示
 * ```
 * const { isReady, generateKeyPair, encrypt, decrypt, maskValue, exportEncryptedPrivateKey } =
 *   useFormEncryption();
 *
 * // 页面挂载时生成或导入密钥对:
 * await generateKeyPair(); // 或 importPublicKey(storedKey)
 *
 * // 提交前加密敏感字段:
 * const encryptedIdCard = await encrypt(formData.idCard);
 *
 * // 模板中显示遮罩:
 * // <span>{{ maskValue(formData.idCard, 6, 4) }}</span>  → "110101********1234"
 *
 * // 导出私钥供用户保存:
 * const backup = await exportEncryptedPrivateKey("user-password");
 * ```
 *
 * ## 关键行为
 * - `generateKeyPair()` 后 `isReady=true`，方可加解密
 * - 密钥未就绪时 `encrypt/decrypt` 抛出明确错误
 * - `maskValue(str, prefix, suffix)` 短字符串原样返回
 * - 加解密往返 (round-trip) 完全一致
 */
import { describe, it, expect } from "vitest";
import { useFormEncryption } from "@/hooks/useFormEncryption";

describe("useFormEncryption", () => {
  // ── 初始状态 ──────────────────────────────────────────

  it("初始 isReady=false，加密/解密不可用", () => {
    const { isReady } = useFormEncryption();
    expect(isReady.value).toBe(false);
  });

  // ── 密钥生成 ──────────────────────────────────────────

  it("generateKeyPair → 生成公私钥对，isReady=true", async () => {
    const { generateKeyPair, isReady } = useFormEncryption();
    const keys = await generateKeyPair();
    expect(keys.publicKey).toBeDefined();
    expect(keys.privateKey).toBeDefined();
    expect(isReady.value).toBe(true);
  });

  // ── Round-trip：加密 → 解密 → 原始明文 ───────────────

  it("encrypt(plaintext) → decrypt(ciphertext) → 还原原始值", async () => {
    const { generateKeyPair, encrypt, decrypt } = useFormEncryption();
    await generateKeyPair();
    const plaintext = "Hello, World!";
    const ciphertext = await encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(await decrypt(ciphertext)).toBe(plaintext);
  });

  // ── 错误处理 ──────────────────────────────────────────

  it("未生成密钥时 encrypt → 抛出 'Public key not available'", async () => {
    const { encrypt } = useFormEncryption();
    await expect(encrypt("test")).rejects.toThrow("Public key not available");
  });

  it("未生成密钥时 decrypt → 抛出 'Private key not available'", async () => {
    const { decrypt } = useFormEncryption();
    await expect(decrypt("dGVzdA==")).rejects.toThrow("Private key not available");
  });

  // ── 遮罩：前端展示用，保留首尾 ────────────────────────

  it("maskValue('110101199001011234', 6, 4) → '110101********1234'", () => {
    const { maskValue } = useFormEncryption();
    expect(maskValue("110101199001011234", 6, 4)).toBe("110101********1234");
  });

  it("字符串长度不足 prefix+suffix → 原样返回", () => {
    const { maskValue } = useFormEncryption();
    expect(maskValue("ab", 6, 4)).toBe("ab");
  });

  it("空字符串 → 返回空字符串", () => {
    const { maskValue } = useFormEncryption();
    expect(maskValue("")).toBe("");
  });

  // ── 密钥导入/导出 ─────────────────────────────────────

  it("importPublicKey(JWK) → 可用导入的公钥加密", async () => {
    const { generateKeyPair, importPublicKey, encrypt } = useFormEncryption();
    const keys = await generateKeyPair();
    await importPublicKey(keys.publicKey);
    const ciphertext = await encrypt("import-test");
    expect(ciphertext).toBeDefined();
  });

  it("exportEncryptedPrivateKey('strong-password') → 返回 AES-GCM 加密字符串", async () => {
    const { generateKeyPair, exportEncryptedPrivateKey } = useFormEncryption();
    await generateKeyPair();
    const exported = await exportEncryptedPrivateKey("strong-password");
    expect(typeof exported).toBe("string");
    expect(exported.length).toBeGreaterThan(0);
  });
});