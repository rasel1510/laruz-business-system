import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import prisma from "./db";
import { sendEmail, buildOtpEmailHtml } from "./email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        minPasswordLength: 6,
    },
    user: {
        additionalFields: {
            mobile: {
                type: "string",
                required: true,
                input: true,
            },
        },
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                const subject =
                    type === "forget-password"
                        ? "Reset Your Password — Laruz"
                        : type === "email-verification"
                            ? "Verify Your Email — Laruz"
                            : "Your Login Code — Laruz";

                void sendEmail({
                    to: email,
                    subject,
                    html: buildOtpEmailHtml(otp, type),
                });
            },
        }),
    ],
});
