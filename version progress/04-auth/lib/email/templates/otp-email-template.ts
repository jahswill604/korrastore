// lib/email/templates/otp-email-template.ts — Professional HTML Email Template for KorraStore Email OTP Verification.
// Generates responsive, email-client-compatible HTML email layout following KorraStore Light Mode design tokens.
// Uses Paper (#F7F4EA) background, Soil (#4A3828) text, Harvest Wheat (#D8B56A) accents, and monospace 6-digit OTP code styling.
// Used in: Supabase Auth custom email templates & Resend outbox notification services.

export interface OtpEmailOptions {
  otpCode: string; // 6-digit numeric OTP code (e.g. "482915")
  recipientEmail: string; // User email address
  recipientName?: string; // User full name
  expiresInMinutes?: number; // Expiration duration (default: 10)
}

// ----------------------------------------------------------------------------
// generateOtpEmailHtml — builds clean, responsive HTML email string.
// Formatted with inline CSS table layout for maximum email client compatibility
// (Gmail, Apple Mail, Outlook, Android Mail).
// ----------------------------------------------------------------------------
export function generateOtpEmailHtml({
  otpCode,
  recipientName = "Valued Customer",
  expiresInMinutes = 10,
}: OtpEmailOptions): string {
  // Format code digits with spacing for visual clarity
  const formattedCode = otpCode.split("").join(" ");

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
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F7F4EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EA; color: #4A3828;">

  <!-- Outer Email Container Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EA; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max Width 540px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 2px solid #E4DCC8; border-radius: 16px; box-shadow: 0 4px 12px rgba(74, 56, 40, 0.06); overflow: hidden;">
          
          <!-- Top Header Band -->
          <tr>
            <td align="center" style="background-color: #21483A; padding: 24px 30px; border-bottom: 3px solid #D8B56A;">
              <span style="font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px; text-decoration: none;">
                🌾 KorraStore
              </span>
              <div style="font-size: 11px; font-weight: 600; color: #D8B56A; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                Verified Agricultural Commodity Storage
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: left;">
              <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #4A3828; margin: 0 0 12px 0;">
                Your Email Verification Code
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #6C5E4F; margin: 0 0 24px 0;">
                Hello <strong>${recipientName}</strong>,<br>
                Use the 6-digit verification code below to complete your account security setup on KorraStore.
              </p>

              <!-- Prominent Numeric OTP Code Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #F7F4EA; border: 2px dashed #D8B56A; border-radius: 12px; padding: 20px 15px;">
                    <span style="font-size: 11px; font-weight: 700; color: #A88958; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      SECURITY VERIFICATION CODE
                    </span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4A3828; letter-spacing: 8px; display: block;">
                      ${formattedCode}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Security Information Note -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF8; border-left: 4px solid #D8B56A; padding: 12px 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #7A6A58;">
                    <strong>⏱️ Security Note:</strong> This verification code will expire in <strong>${expiresInMinutes} minutes</strong>. Never share this code with anyone. KorraStore staff will never ask for your code.
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #8C7D6E; margin: 0;">
                If you did not request this registration or verification code, please disregard this email or contact support if you suspect unauthorized activity.
              </p>
            </td>
          </tr>

          <!-- Footer Band -->
          <tr>
            <td align="center" style="background-color: #F7F4EA; padding: 20px 30px; border-top: 1px solid #E4DCC8; font-size: 11px; color: #8C7D6E; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #4A3828;">
                KorraStore Digital Commodity Warehouse System
              </p>
              <p style="margin: 0;">
                Certified Silo Facilities in Kano, Kebbi & Benue • Nigeria
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
