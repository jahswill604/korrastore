# Supabase OTP Fix — Magic Link Template Update

## Why you're still getting a link

`supabase.auth.signInWithOtp()` sends the **"Magic Link"** email template — NOT "Confirm signup".
By default, that template contains `{{ .ConfirmationURL }}` which is a clickable link.

You must update the **"Magic Link"** template to use `{{ .Token }}` instead.

---

## What to update in Supabase Dashboard

### 1. Go to: Authentication → Email Templates → **Magic Link**

(NOT "Confirm signup" — that's a different template)

URL: https://supabase.com/dashboard/project/kkyfinelyzriqacxqhfu/auth/templates

---

### 2. Set the Subject to:
```
Your KorraStore Verification Code — {{ .Token }}
```

---

### 3. Replace the ENTIRE Body (HTML) with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KorraStore Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EA; padding: 36px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 2px solid #E4DCC8; border-radius: 16px; overflow: hidden;">
          <tr>
            <td align="center" style="background-color: #21483A; padding: 26px 30px; border-bottom: 4px solid #D8B56A;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #FFFFFF; display: block;">🌾 KorraStore</span>
              <span style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; display: block;">Agricultural Commodity Storage</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center;">
              <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #4A3828; margin: 0 0 10px 0;">Your Verification Code</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #6C5E4F; margin: 0 0 26px 0;">Enter this 6-digit code to verify your KorraStore account.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto; background-color: #21483A; border-radius: 14px; padding: 20px 36px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 10px; font-weight: 700; color: #D8B56A; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">VERIFICATION CODE</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 800; color: #FFFFFF; letter-spacing: 12px;">{{ .Token }}</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF8; border-left: 4px solid #D8B56A; padding: 14px 16px; margin: 0 0 20px 0; border-radius: 6px; text-align: left;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #4A3828;"><strong>⏱️ Expires in 10 minutes.</strong> Do not share this code with anyone.</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #F7F4EA; padding: 18px 30px; border-top: 1px solid #E4DCC8; font-size: 11px; color: #8C7D6E;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #4A3828;">KorraStore Digital Commodity Warehouse System</p>
              <p style="margin: 0;">Lagos, Kano & Benue Silo Facilities • Nigeria</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. Click **Save**.

---

## Also check: Auth → Providers → Email

Make sure:
- **OTP Expiry** is set to `600` (10 minutes)
- **Enable Email OTP** is toggled ON (if available)

---

## After saving the template

Try signing up again at `/signup`. You should now receive an email with just a large 6-digit number like:

```
4 8 2 9 1 5
```

Enter those 6 digits on the `/verify-email` page.
