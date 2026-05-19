"use server";

import prisma from "@/lib/db";
import { z } from "zod";

const emailSchema = z.string().email();

export async function checkUserStatus(email: string) {
  try {
    const validated = emailSchema.parse(email);
    const user = await prisma.user.findUnique({
      where: { email: validated },
    });
    return { success: true, registered: !!user };
  } catch (error) {
    return { success: false, error: "Invalid email format" };
  }
}

export async function checkMobileUnique(mobile: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { mobile: mobile.trim() },
    });
    return { success: true, unique: !user };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}
