import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  await transporter.sendMail({
    from: `"Laruz Business" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export function buildOtpEmailHtml(otp: string, type: string): string {
  const heading =
    type === "forget-password"
      ? "Reset Your Password"
      : type === "email-verification"
        ? "Verify Your Email"
        : "Your Login Code";

  const message =
    type === "forget-password"
      ? "We received a request to reset your password. Use the code below to set a new password."
      : type === "email-verification"
        ? "Please verify your email address by entering the code below."
        : "Use the code below to sign in to your account.";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0; padding:0; background-color:#050816; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050816; padding:40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="420" cellspacing="0" cellpadding="0" style="background-color:#0b132b; border:1px solid #1a2340; border-radius:24px; overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:32px 32px 0; text-align:center;">
                  <h1 style="margin:0; font-size:20px; font-weight:600; color:#ffffff; letter-spacing:0.5px;">
                    ${heading}
                  </h1>
                </td>
              </tr>
              <!-- Message -->
              <tr>
                <td style="padding:16px 32px 0; text-align:center;">
                  <p style="margin:0; font-size:14px; color:#94a3b8; line-height:1.6;">
                    ${message}
                  </p>
                </td>
              </tr>
              <!-- OTP Code -->
              <tr>
                <td style="padding:24px 32px; text-align:center;">
                  <div style="display:inline-block; background-color:#050816; border:1px solid #1a2340; border-radius:16px; padding:16px 40px;">
                    <span style="font-size:32px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:8px; color:#3b82f6;">
                      ${otp}
                    </span>
                  </div>
                </td>
              </tr>
              <!-- Expiry Notice -->
              <tr>
                <td style="padding:0 32px 8px; text-align:center;">
                  <p style="margin:0; font-size:12px; color:#64748b;">
                    This code will expire in <strong style="color:#94a3b8;">5 minutes</strong>.
                  </p>
                </td>
              </tr>
              <!-- Warning -->
              <tr>
                <td style="padding:0 32px 32px; text-align:center;">
                  <p style="margin:0; font-size:11px; color:#475569;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:16px 32px; border-top:1px solid #1a2340; text-align:center;">
                  <p style="margin:0; font-size:11px; color:#334155;">
                    &copy; Laruz Business System
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
