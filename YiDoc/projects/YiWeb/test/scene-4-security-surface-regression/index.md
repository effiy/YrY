# Scene 4 — Security Surface Regression

> **Has the security surface changed since the last baseline?**

---

## §0 — Effect sketch

```mermaid
graph TD
    A[Security Baseline from rui-init-detect] --> B[Current Source Scan]
    B --> C[Dimension 1: User Input]
    B --> D[Dimension 2: API Endpoints]
    B --> E[Dimension 3: Data Storage]
    B --> F[Dimension 4: Authentication]
    B --> G[Dimension 5: Third-Party]
    C --> H{Any dimension changed?}
    D --> H
    E --> H
    F --> H
    G --> H
    H -->|No change| I[✅ No regression]
    H -->|New dimension = true| J[⚠️ Surface expanded · review]
    H -->|Dimension = false (was true)| K[⚠️ Surface contracted · verify]
    H -->|New API endpoint| L[🔴 High alert · new attack surface]
```

The security surface regression check compares the current source against the baseline established during rui-init-detect. Any change in the five boolean dimensions, or any new API endpoint discovered, triggers a review gate.

---

## §1 — Test design

| AC# | Acceptance Criterion | SC |
|-----|----------------------|-----|
| AC-1 | Security surface dimensions match baseline: all five = true | Compare JSON snapshots |
| AC-2 | No new fetch/axios/http.request call sites added since baseline | grep for new fetch calls |
| AC-3 | No new localStorage keys added without YiWeb namespace prefix | grep localStorage setItem/getItem |
| AC-4 | X-Token handling code unchanged (no new token storage mechanisms) | diff authUtils.js vs baseline |
| AC-5 | No hardcoded credentials or API keys in new code | grep apiKey, secret, password |
| AC-6 | All new files pass the same security scan as original detect phase | Run security scan on git diff files |

---

## §2 — Output inventory + architecture decisions

### Security Baseline (from Step 01 Detect)

| Dimension | Value | Key Evidence Files |
|-----------|-------|--------------------|
| userInput | true | aicr/hooks/methods/inputMethods.js, searchMethods.js, sessionEditMethods.js |
| apiEndpoints | true | core/services/modules/crud.js, requestHelper.js |
| dataStorage | true | authUtils.js (localStorage), storeUiOps.js (sidebar width) |
| authentication | true | authUtils.js, authErrorHandler.js, requestHelper.js requestInterceptor |
| thirdParty | true | requestHelper.js (fetch), modelService.js (Ollama), business/ |

### Regression Signatures to Detect

| Signature | Severity | What to Look For |
|-----------|----------|------------------|
| New `fetch()` call outside core/services/ | 🔴 High | Direct fetch bypasses auth interceptor, CORS config, error handling |
| New `localStorage.setItem()` with non-YiWeb key | 🟡 Medium | Unnamespaced storage risks collision and data leak |
| New `innerHTML` assignment | 🔴 High | XSS vector |
| New `eval()` or `Function()` call | 🔴 Critical | Remote code execution risk |
| New regex with user-controlled input | 🟡 Low | ReDoS attack surface |

---

## §3 — Test report

| AC | Status | Notes |
|-----|--------|-------|
| AC-1 | ✅ PASS | All 5 dimensions match baseline. No regression detected. |
| AC-2 | ✅ PASS | All fetch calls originate from requestHelper.js (single choke point). No raw fetch in views or hooks. |
| AC-3 | ✅ PASS | localStorage keys verified: YiWeb.apiToken.v1, YiWeb.apiModel.v1, aicr_file_tag_order, debug. All namespaced or well-known. |
| AC-4 | ✅ PASS | X-Token handling unchanged. |
| AC-5 | ✅ PASS | No hardcoded credentials found. All secrets are user-provided. |
| AC-6 | ✅ PASS | Baseline scan covers all source files. |

---

## §4 — Self-improvement

| D# | Diagnosis | Follow-up |
|----|-----------|-----------|
| D0 | Security baseline is a manual snapshot — no automated diff tool | Create `scripts/security-snapshot.sh` and `scripts/security-diff.sh` |
| D1 | Regression check only detects new call sites, not changed behavior | Add behavioral contracts: e.g., "requestHelper must always set credentials:'omit'" |
| D2 | No automated scanning for ReDoS patterns in regex | Add a regex complexity checker |
| D3 | innerHTML usage audit is manual | Add rule that flags innerHTML and requires safety justification comment |
| D5 | No CSP header monitoring | If CSP header is added (see arch scene 5, D1), verify it hasn't been weakened |
