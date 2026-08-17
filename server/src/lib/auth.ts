import { randomUUID } from "node:crypto";
import { sendEmail } from "./email";
import { env } from "./env";
import { prisma } from "./prisma";

const baseURL = env.betterAuthUrl;
const supportEmail = env.supportEmail;
const trustedOrigins = Array.from(
  new Set(
    [
      ...env.trustedOrigins,
      env.trustedOrigin,
      env.betterAuthUrl,
      "http://localhost:3000",
    ].filter(Boolean),
  ),
);

const googleClientId = env.googleClientId;
const googleClientSecret = env.googleClientSecret;
const useSecureCookies = env.nodeEnv === "production";
const requireEmailVerification = useSecureCookies;

let _authInstance: any = null;

export async function getAuth() {
  if (!_authInstance) {
    const { betterAuth } = await import("better-auth");
    const { prismaAdapter } = await import("better-auth/adapters/prisma");

    _authInstance = betterAuth({
      database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
      baseURL,
      secret: env.betterAuthSecret,
      trustedOrigins,
  user: {
    changeId: false,
    additionalFields: {
      phone: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectURI: `${baseURL}/api/auth/callback/google`,
            prompt: "select_account",
          },
        }
      : undefined,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    sendResetPassword: async ({ user, url }: any, request: any) => {
      // Extract token from URL - handle different URL formats
      const urlObj = new URL(url);
      const token =
        urlObj.searchParams.get("token") || urlObj.pathname.split("/").pop();
      const frontendUrl = `${env.trustedOrigin}/reset-password?token=${token}`;

      void sendEmail({
        to: user.email,
        subject: "Reset your password - Nabis Fashton",
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
  </head>

  <body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, sans-serif; color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px;">
            <tr>
              <td style="padding:20px 24px; border-bottom:1px solid #e5e7eb;">
                <p style="margin:0; font-size:18px; font-weight:700; color:#111827;">Nabis Fashton</p>
                <p style="margin:6px 0 0 0; font-size:12px; color:#6b7280;">Security notification</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px; font-size:20px; font-weight:600;">
                Reset Your Password
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px; font-size:14px; color:#374151; line-height:1.7;">
                Hi There,<br><br>
                We received a request to reset your password for your Nabis Fashton account.
                Click the button below to set a new password.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:24px;">
                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td align="center" bgcolor="#1d4ed8" style="border-radius:8px;">
                      <a
                        href="${frontendUrl}"
                        target="_blank"
                        style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;"
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px; font-size:13px; color:#4b5563; line-height:1.7;">
                This link will expire in 1 hour for security reasons.<br>
                If you didn't request this, you can safely ignore this email.
              </td>
            </tr>

            <tr>
              <td style="padding:24px; font-size:13px; color:#6b7280;">
                Thanks,<br>
                Nabis Fashton Team
              </td>
            </tr>

          </table>

          <div style="max-width:560px; margin-top:16px; font-size:12px; color:#6b7280; text-align:left; line-height:1.7;">
            Need help? Contact us at
            <a href="mailto:${supportEmail}" style="color:#1d4ed8; text-decoration:none;">
              ${supportEmail}
            </a><br>

            500 Medical Park Drive, Sylhet<br>
            © 2025 Nabis Fashton
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      });
    },
    onPasswordReset: async ({ user }: any, request: any) => {},
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: requireEmailVerification,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: any) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email - Nabis Fashton",
        html: `<p>Verify your Nabis Fashton email address by clicking this link:</p><p><a href="${url}">Verify email address</a></p><p>This link expires in one hour.</p>`,
      });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": { window: 60, max: 5 },
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  advanced: {
    database: {
      generateId: "serial",
    },
    defaultCookieAttributes: {
      sameSite: useSecureCookies ? "none" : "lax",
      secure: useSecureCookies,
      path: "/",
      httpOnly: true,
    },
    crossSubDomainCookies: {
      enabled: useSecureCookies,
    },
  },
});
  }
  return _authInstance;
}

export const auth: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!_authInstance) {
        throw new Error("Auth not initialized yet. Call getAuth() first.");
      }
      return (_authInstance as any)[prop];
    },
  },
);
