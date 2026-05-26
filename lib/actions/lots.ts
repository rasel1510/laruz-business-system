"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const lotItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  buyingPrice: z.number().min(0, "Buying price cannot be negative"),
});

const lotSchema = z.object({
  description: z.string().optional(),
  date: z.date().optional(),
  items: z.array(lotItemSchema).min(1, "At least one product is required in a lot"),
});

export async function getLots() {
  try {
    return await prisma.lot.findMany({
      orderBy: { date: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch lots:", error);
    return [];
  }
}

export async function addLot(data: z.infer<typeof lotSchema>) {
  try {
    const validated = lotSchema.parse(data);

    // Auto-generate lot code (e.g. #LOT-001)
    const lastLot = await prisma.lot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastLot) {
      const match = lastLot.lotCode.match(/LOT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const lotCode = `#LOT-${nextNumber.toString().padStart(3, "0")}`;

    // Calculate totals
    const totalQuantity = validated.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalValue = validated.items.reduce((acc, item) => acc + item.quantity * item.buyingPrice, 0);

    // Perform database transaction to ensure data integrity
    const lot = await prisma.$transaction(async (tx) => {
      // 1. Create the Lot
      const newLot = await tx.lot.create({
        data: {
          lotCode,
          description: validated.description,
          date: validated.date || new Date(),
          totalQuantity,
          totalValue,
        },
      });

      // 2. Create LotItems and update Product stock/buying prices
      for (const item of validated.items) {
        // Create LotItem
        await tx.lotItem.create({
          data: {
            lotId: newLot.id,
            productId: item.productId,
            quantity: item.quantity,
            buyingPrice: item.buyingPrice,
          },
        });

        // Fetch current product to check if it exists
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!currentProduct) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Update product stock and buyingPrice
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: currentProduct.stock + item.quantity,
            buyingPrice: item.buyingPrice, // Update to latest buying price
          },
        });
      }

      return newLot;
    });

    // Revalidate paths
    revalidatePath("/lots");
    revalidatePath("/Inventory");
    revalidatePath("/");

    return { success: true, lot };
  } catch (error) {
    console.error("Failed to add lot:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}
