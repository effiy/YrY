# Geeker Easy-Mock → Apifox migration package

Converted from `src/assets/mock/geeker/` (original Easy-Mock). **Endpoint paths / methods / response logic are preserved.**

## Files

| File | Purpose |
| --- | --- |
| `geeker.openapi.json` | **Main import file** (OpenAPI 3.0, Apifox-import compatible) |
| `mock-scripts/*.js` | "Advanced Mock → Script" for dynamic endpoints (preserves original Easy-Mock branch logic) |
| `geeker.mock-expectations.json` | Optional reference: expectation conditions for login / menu / button |
| `generate.mjs` | Regeneration script (re-run after editing geeker source files) |

## Import steps (Apifox)

1. Open Apifox project → **Project Settings → Import Data → OpenAPI / Swagger**
2. Select `geeker.openapi.json` from this directory
3. Recommended options:
   - Import Servers as environments: enabled
   - Endpoint conflict: overwrite existing (first import) or smart merge
4. After import, open **Advanced Mock → Script** for the dynamic endpoints below, paste the corresponding `.js` content, and **toggle the switch on**:

| Endpoint | Script file |
| --- | --- |
| `POST /geeker/login` | `mock-scripts/login.js` |
| `GET /geeker/menu/list` | `mock-scripts/menu-list.js` |
| `GET /geeker/auth/buttons` | `mock-scripts/auth-buttons.js` |
| `POST /geeker/user/list` | `mock-scripts/user-list.js` |
| `POST /geeker/user/tree/list` | `mock-scripts/user-tree-list.js` |
| `POST /geeker/account/list` | `mock-scripts/account-list.js` |
| `POST /geeker/file/upload/img` | `mock-scripts/file-upload-img.js` |

The remaining static endpoints (logout, CRUD, dictionaries, video upload, etc.) work directly from the imported **response examples** — no script needed.

> Note: The OpenAPI standard does not carry Mock scripts; the `x-apifox.mockScript` extension is written into the openapi file. If your Apifox version does not auto-recognize it, paste scripts manually per the table above — logic matches the source files.

## Wiring the frontend proxy

Copy the Apifox Mock base URL (cloud or local), then edit `.env.development`:

```bash
# Example: replace the original Easy-Mock URL with the Apifox Mock URL
VITE_PROXY = [["/api","https://mock.apifox.cn/m1/your-project-id"]]
```

Frontend requests remain `/api` + `/geeker/...`, identical to before.

## Demo accounts (same as original Easy-Mock)

| Username | Plaintext password | body.password (MD5) | access_token |
| --- | --- | --- | --- |
| `admin` | `123456` | `e10adc3949ba59abbe56e057f20f883e` | `bqddxxwqmfncffacvbpkuxvwvqrhln` |
| `user` | `123456` | same as above | `unufvdotdqxuzfbdygovfmsbftlvbn` |

Menu / button permissions still differentiate admin / user via the `x-access-token` request header.

## Regeneration

```bash
node src/assets/mock/apifox/generate.mjs
```

Re-reads Easy-Mock source files from `../geeker/` and overwrites the artifacts in this directory.
