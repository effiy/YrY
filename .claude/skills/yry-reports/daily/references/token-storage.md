# Token Storage

`DAILY_DEV_TOKEN` resolution order (skill checks in this sequence):

1. `$DAILY_DEV_TOKEN` environment variable (already exported)
2. OS keychain / credential manager (look up by service name
   `daily-dev-api` and username `$USER`)
3. Prompt the user to run the setup command for their platform

The token requires a **daily.dev Plus subscription**:
https://app.daily.dev/plus

Generate one at: https://app.daily.dev/settings/api

---

## macOS — Keychain

```bash
# Store
security add-generic-password -a "$USER" -s "daily-dev-api" -w "dda_your_token"

# Retrieve
security find-generic-password -a "$USER" -s "daily-dev-api" -w

# Auto-load in ~/.zshrc or ~/.bashrc
export DAILY_DEV_TOKEN=$(security find-generic-password -a "$USER" -s "daily-dev-api" -w 2>/dev/null)
```

## Windows — Credential Manager

```powershell
# Store (run once in PowerShell)
$credential = New-Object System.Management.Automation.PSCredential(
    "daily-dev-api",
    (ConvertTo-SecureString "dda_your_token" -AsPlainText -Force)
)
$credential | Export-Clixml "$env:USERPROFILE\.daily-dev-credential.xml"

# Retrieve — add to PowerShell profile ($PROFILE)
$cred = Import-Clixml "$env:USERPROFILE\.daily-dev-credential.xml"
$env:DAILY_DEV_TOKEN = $cred.GetNetworkCredential().Password
```

Or use the GUI: Control Panel → Credential Manager → Windows
Credentials → Add a generic credential with
`daily-dev-api` / `$env:USERNAME`.

## Linux — Secret Service (GNOME Keyring / KWallet)

```bash
# Requires libsecret-tools
# Ubuntu/Debian: sudo apt install libsecret-tools
# Fedora:        sudo dnf install libsecret

# Store
echo "dda_your_token" | secret-tool store \
    --label="daily.dev API Token" \
    service daily-dev-api \
    username "$USER"

# Retrieve
secret-tool lookup service daily-dev-api username "$USER"

# Auto-load in ~/.bashrc or ~/.zshrc
export DAILY_DEV_TOKEN=$(secret-tool lookup service daily-dev-api username "$USER" 2>/dev/null)
```

---

## Resolution helpers (use these exact commands)

**macOS:**
```bash
export DAILY_DEV_TOKEN=$(security find-generic-password -a "$USER" -s "daily-dev-api" -w 2>/dev/null)
```

**Linux:**
```bash
export DAILY_DEV_TOKEN=$(secret-tool lookup service daily-dev-api username "$USER" 2>/dev/null)
```

**Windows (PowerShell):**
```powershell
$cred = Import-Clixml "$env:USERPROFILE\.daily-dev-credential.xml" 2>$null
$env:DAILY_DEV_TOKEN = $cred.GetNetworkCredential().Password
```

After running the appropriate helper, check
`[[ -n "$DAILY_DEV_TOKEN" ]]` (or `[string]::IsNullOrEmpty` on
Windows) before making the first API call. If it's still empty, walk
the user through the platform setup above.
