import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

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
});
