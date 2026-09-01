// lib/email/templates/otp-email-template.ts — Professional HTML Email Template for KorraStore Email OTP Verification.
// Generates responsive, email-client-compatible HTML email layout following KorraStore Light Mode design tokens.
// Uses Paper (#F7F4EA) background, Soil (#4A3828) text, Harvest Wheat (#D8B56A) accents, and 6-digit cell grid OTP code styling.
// Used in: Supabase Auth custom email templates & Resend outbox notification services.

export interface OtpEmailOptions {
  otpCode: string; // 6-digit numeric OTP code (e.g. "482915")
  recipientEmail: string; // User email address
  recipientName?: string; // User full name
  expiresInMinutes?: number; // Expiration duration (default: 10)
}

// ----------------------------------------------------------------------------
// generateOtpEmailHtml — builds clean, responsive HTML email string.
// Renders a 6-cell digit grid for maximum visual appeal across email clients.
// ----------------------------------------------------------------------------
export function generateOtpEmailHtml({
  otpCode,
  recipientName = "Valued Customer",
  expiresInMinutes = 10,
}: OtpEmailOptions): string {
  // Extract digits for cell grid rendering (default to 6 digits)
  const digits = otpCode.trim().split("");
  while (digits.length < 6) digits.push("•");

  const digitCellsHtml = digits
    .slice(0, 6)
    .map(
      (d) => `
        <td align="center" valign="middle" style="width: 44px; height: 52px; background-color: #FFFFFF; border: 2px solid #D8B56A; border-radius: 10px; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; color: #21483A; shadow: 0 2px 4px rgba(0,0,0,0.04);">
          ${d}
        </td>`
    )
    .join('<td style="width: 8px;"></td>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KorraStore Verification Code</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F7F4EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EA; color: #4A3828;">

  <!-- Outer Email Container Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EA; padding: 36px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max Width 520px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 2px solid #E4DCC8; border-radius: 16px; box-shadow: 0 4px 16px rgba(74, 56, 40, 0.08); overflow: hidden;">
          
          <!-- Top Header Band -->
          <tr>
            <td align="center" style="background-color: #21483A; padding: 26px 30px; border-bottom: 4px solid #D8B56A;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px; text-decoration: none; display: block;">
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
                Hello <strong>${recipientName}</strong>, enter the 6-digit security code below to verify your account on KorraStore.
              </p>

              <!-- Beautiful 6-Digit Cell Grid Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto; background-color: #F7F4EA; border: 2px dashed #D8B56A; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        ${digitCellsHtml}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Information Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF8; border-left: 4px solid #21483A; padding: 14px 16px; margin: 0 0 24px 0; border-radius: 6px; text-align: left;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #4A3828;">
                    <strong>⏱️ Code Expiration:</strong> This code is valid for <strong>${expiresInMinutes} minutes</strong>. If you did not request this verification code, please ignore this email.
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; line-height: 1.5; color: #8C7D6E; margin: 0;">
                KorraStore security team will never ask for your verification code.
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
  `.trim();
}
