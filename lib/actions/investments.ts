"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const investorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(5, "Phone is required"),
  investmentAmount: z.number().min(0, "Investment amount cannot be negative"),
  profitSharePct: z.number().min(0).max(100, "Profit share must be 0–100%"),
  durationMonths: z.number().int().min(1).nullable(),
  isSharePartner: z.boolean(),
});

const paymentSchema = z.object({
  investorId: z.string().min(1, "Investor ID is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  date: z.preprocess(
    (val) => (val ? new Date(val as string) : new Date()),
    z.date()
  ),
  note: z.string().optional(),
});

// ─── Investor CRUD ────────────────────────────────────────────────────────────

export async function addInvestor(data: z.infer<typeof investorSchema>) {
  try {
    const validated = investorSchema.parse(data);

    const investor = await prisma.investor.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        investmentAmount: validated.investmentAmount,
        profitSharePct: validated.profitSharePct,
        durationMonths: validated.durationMonths,
        isSharePartner: validated.isSharePartner,
      },
    });

    revalidatePath("/finance/investments");
    return { success: true, investor };
  } catch (error) {
    console.error("Failed to add investor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getInvestors() {
  try {
    return await prisma.investor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch investors:", error);
    return [];
  }
}

export async function deleteInvestor(id: string) {
  try {
    await prisma.investor.delete({
      where: { id },
    });

    revalidatePath("/finance/investments");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete investor:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateInvestor(
  id: string,
  data: z.infer<typeof investorSchema>
) {
  try {
    const validated = investorSchema.parse(data);

    const investor = await prisma.investor.update({
      where: { id },
      data: {
        name: validated.name,
        phone: validated.phone,
        investmentAmount: validated.investmentAmount,
        profitSharePct: validated.profitSharePct,
        durationMonths: validated.durationMonths,
        isSharePartner: validated.isSharePartner,
      },
    });

    revalidatePath("/finance/investments");
    return { success: true, investor };
  } catch (error) {
    console.error("Failed to update investor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

// ─── Payment CRUD ─────────────────────────────────────────────────────────────

export async function addPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const validated = paymentSchema.parse(data);

    const payment = await prisma.investorPayment.create({
      data: {
        investorId: validated.investorId,
        amount: validated.amount,
        date: validated.date,
        note: validated.note || null,
      },
    });

    revalidatePath("/finance/investments");
    return { success: true, payment };
  } catch (error) {
    console.error("Failed to add payment:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function deletePayment(id: string) {
  try {
    await prisma.investorPayment.delete({
      where: { id },
    });

    revalidatePath("/finance/investments");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete payment:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
