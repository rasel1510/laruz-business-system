"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logActivity(
  action: string,
  category: string,
  details: string,
  user: string = "System"
) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        action,
        category,
        details,
        user,
      },
    });
    revalidatePath("/activity-logs");
    return { success: true, log };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Failed to create activity log" };
  }
}

export async function getActivityLogs() {
  try {
    return await prisma.activityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100, // retrieve latest 100 logs
    });
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }
}


