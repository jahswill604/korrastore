# Supabase + Resend Email Verification — Full Setup Guide

## How it Works (Important to Understand)

```
Signup → Supabase Auth generates Token A → Sends Token A via SMTP (Resend) → User enters Token A → verifyOtp succeeds ✅
```

**Supabase Auth** is the source of truth for the OTP token. It generates the real 6-digit code and must deliver it via **Resend's SMTP server**. The token in your inbox is the one `verifyOtp` checks against.

> ⚠️ **Never generate a separate random code and send it via Resend directly.** That creates a token mismatch and will always result in "Token has expired or is invalid."

---

## Step 1: Configure Custom SMTP in Supabase Dashboard

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/kkyfinelyzriqacxqhfu).
2. Click **Authentication** → **SMTP Settings** (under *Configuration* in the left sidebar).
3. Toggle **Enable Custom SMTP** to **ON**.
4. Fill in these credentials exactly:

| Field | Value |
|-------|-------|
| **Sender Email** | `onboarding@resend.dev` |
| **Sender Name** | `KorraStore` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Minimum Encryption** | `SSL` |
| **Username** | `resend` |
| **Password** | `re_YOUR_RESEND_API_KEY_HERE` |

5. Click **Save**.

---

## Step 2: Set the KorraStore OTP Email Template in Supabase

1. Go to **Authentication** → **Email Templates** in your Supabase Dashboard.
2. Click **Confirm signup**.
3. **Change Email OTP Expiry**: Go to **Authentication** → **Providers** → **Email** and set OTP Expiry to `600` seconds (10 minutes).
4. Update the **Subject** line:
   ```text
   Your KorraStore Verification Code — {{ .Token }}
   ```
5. Paste this template in the **Body (HTML)** editor:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KorraStore Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EA; color: #4A3828; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EA; padding: 36px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 2px solid #E4DCC8; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #21483A; padding: 26px 30px; border-bottom: 4px solid #D8B56A;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #FFFFFF; display: block;">
                🌾 KorraStore
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; display: block;">
                Agricultural Commodity Storage & Resale
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center;">

              <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #4A3828; margin: 0 0 10px 0;">
                Your Verification Code
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #6C5E4F; margin: 0 0 26px 0;">
                Use the 6-digit code below to verify your KorraStore account.
              </p>

              <!-- Code Display -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto; background-color: #21483A; border-radius: 14px; padding: 18px 32px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                      VERIFICATION CODE
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #FFFFFF; letter-spacing: 10px; padding: 0 4px;">
                      {{ .Token }}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF8; border-left: 4px solid #D8B56A; padding: 14px 16px; margin: 0 0 20px 0; border-radius: 6px; text-align: left;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #4A3828;">
                    <strong>⏱️ Expires in 10 minutes.</strong> Do not share this code with anyone — KorraStore staff will never ask for it.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F7F4EA; padding: 18px 30px; border-top: 1px solid #E4DCC8; font-size: 11px; color: #8C7D6E; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #4A3828;">
                KorraStore Digital Commodity Warehouse System
              </p>
              <p style="margin: 0;">
                Lagos, Kano & Benue Silo Facilities • Nigeria
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

6. Click **Save**.

---

## Step 3: Disable Magic Links & Enable OTP in Supabase

1. Go to **Authentication** → **Providers** → **Email**.
2. Make sure **"Enable Email OTP"** is toggled **ON** (not magic link redirect).
3. Set **OTP Expiry** to `600` (10 minutes).
4. Click **Save**.

---

## Step 4: Test the Full Flow

1. Register a new account at `/signup` in your app.
2. Supabase sends the 6-digit code via Resend SMTP (styled with your custom template).
3. Copy the **6-digit number** from the email (e.g. `482915`).
4. Enter the digits on `/verify-email`.
5. ✅ Verification succeeds!

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Token has expired or is invalid` | Entering old/wrong code | Use the **latest** code from your most recent email. Each new signup/resend invalidates previous codes. |
| `Email rate limit exceeded` | Too many requests | Wait 2–5 minutes. Or increase limit in Supabase Dashboard → Auth → Rate Limits. |
| Emails not arriving | SMTP misconfigured | Re-check SMTP credentials in Supabase Dashboard — especially Username = `resend` and Password = your API key. |
