# KorraStore Supabase Email Template (Confirm Signup)

## How to Set this Up in Supabase Dashboard (5-Minute Step)

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/kkyfinelyzriqacxqhfu/auth/templates).
2. Click **Authentication** → **Email Templates** (in the left sidebar).
3. Click **Confirm signup**.
4. Change the **Subject** to:
   ```text
   Your KorraStore Verification Code — {{ .Token }}
   ```
5. Replace the ENTIRE **Body (HTML)** editor content with the HTML template below.
6. Click **Save**.

---

## 📋 Copy & Paste This Exact HTML into Supabase Body (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KorraStore Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EA; color: #4A3828; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Outer Email Container Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EA; padding: 36px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max Width 520px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 2px solid #E4DCC8; border-radius: 16px; box-shadow: 0 4px 16px rgba(74, 56, 40, 0.08); overflow: hidden;">

          <!-- Top Header Band (Deep Grain Green) -->
          <tr>
            <td align="center" style="background-color: #21483A; padding: 26px 30px; border-bottom: 4px solid #D8B56A;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px; display: block;">
                🌾 KorraStore
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; display: block;">
                Agricultural Commodity Storage & Resale
              </span>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center;">

              <div style="display: inline-block; background-color: #F7F4EA; border: 1px solid #E4DCC8; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 700; color: #A88958; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                🔐 Account Security Verification
              </div>

              <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #4A3828; margin: 0 0 10px 0;">
                Your Verification Code
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #6C5E4F; margin: 0 0 26px 0; max-width: 400px; display: inline-block;">
                Use the 6-digit verification code below to confirm your account on KorraStore.
              </p>

              <!-- Prominent 6-Digit Numeric Code Display Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto; background-color: #21483A; border-radius: 14px; padding: 22px 36px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
                      VERIFICATION CODE
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; color: #FFFFFF; letter-spacing: 14px; padding-left: 14px;">
                      {{ .Token }}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Information Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF8; border-left: 4px solid #D8B56A; padding: 14px 16px; margin: 0 0 24px 0; border-radius: 6px; text-align: left;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #4A3828;">
                    <strong>⏱️ Code Expiration:</strong> This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone — KorraStore staff will never ask for it.
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; line-height: 1.5; color: #8C7D6E; margin: 0;">
                If you did not request this verification code, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer Band -->
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
