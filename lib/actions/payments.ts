"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/actions/logs";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  courier: z.string().min(1, "Courier source is required"),
  note: z.string().optional(),
  date: z.preprocess((val) => (val ? new Date(val as string) : new Date()), z.date()),
});

export async function addPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const validated = paymentSchema.parse(data);

    const payment = await prisma.payment.create({
      data: {
        amount: validated.amount,
        method: validated.method,
        courier: validated.courier,
        note: validated.note || null,
        date: validated.date,
      },
    });

    await logActivity(
      "CREATE",
      "PAYMENTS",
      `Received payment of ৳${validated.amount.toLocaleString()} via ${validated.method} from ${validated.courier}`
    );

    revalidatePath("/finance/payments");
    revalidatePath("/");
    return { success: true, payment };
  } catch (error) {
    console.error("Failed to add payment:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getPayments() {
  try {
    return await prisma.payment.findMany({
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return [];
  }
}

export async function deletePayment(id: string) {
  try {
    const deleted = await prisma.payment.delete({
      where: { id },
    });

    await logActivity(
      "DELETE",
      "PAYMENTS",
      `Deleted payment of ৳${deleted.amount.toLocaleString()} via ${deleted.method} from ${deleted.courier}`
    );

    revalidatePath("/finance/payments");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete payment:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
