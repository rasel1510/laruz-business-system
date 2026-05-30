"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/actions/logs";

const expenseSchema = z.object({
  itemName: z.string().min(2, "Item Name must be at least 2 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  date: z.preprocess((val) => (val ? new Date(val as string) : new Date()), z.date()),
});

export async function addExpense(data: z.infer<typeof expenseSchema>) {
  try {
    const validated = expenseSchema.parse(data);

    const expense = await prisma.expense.create({
      data: {
        itemName: validated.itemName,
        quantity: validated.quantity,
        price: validated.price,
        date: validated.date,
      },
    });

    await logActivity(
      "CREATE",
      "EXPENSES",
      `Added expense: "${validated.itemName}" (Qty: ${validated.quantity}, Price: ৳${validated.price.toLocaleString()})`
    );

    revalidatePath("/finance/expenses");
    revalidatePath("/");
    return { success: true, expense };
  } catch (error) {
    console.error("Failed to add expense:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getExpenses() {
  try {
    return await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

export async function deleteExpense(id: string) {
  try {
    const deleted = await prisma.expense.delete({
      where: { id },
    });

    await logActivity(
      "DELETE",
      "EXPENSES",
      `Deleted expense item: "${deleted.itemName}" (Qty: ${deleted.quantity}, Price: ৳${deleted.price.toLocaleString()})`
    );

    revalidatePath("/finance/expenses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
