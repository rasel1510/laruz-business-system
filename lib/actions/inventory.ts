"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  image: z.string().optional(),
  buyingPrice: z.number().min(0, "Price cannot be negative"),
  wholesalePrice: z.number().min(0, "Price cannot be negative"),
  retailPrice: z.number().min(0, "Price cannot be negative"),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
});

export async function addProduct(data: z.infer<typeof productSchema>) {
  try {
    const validated = productSchema.parse(data);

    // Auto-generate product code
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastProduct) {
      const match = lastProduct.code.match(/PRD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const code = `#PRD-${nextNumber.toString().padStart(4, "0")}`;

    const product = await prisma.product.create({
      data: {
        ...validated,
        code,
      },
    });

    revalidatePath("/Inventory");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to add product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getNextProductCode() {
  try {
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastProduct) {
      const match = lastProduct.code.match(/PRD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `#PRD-${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Failed to get next product code:", error);
    return "#PRD-0001";
  }
}
export async function updateProduct(id: string, data: Partial<z.infer<typeof productSchema>> & { stockAdjustment?: number }) {
  try {
    const { stockAdjustment, ...updateData } = data;
    
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return { success: false, error: "Product not found" };
    }

    const finalStock = (updateData.stock ?? currentProduct.stock) + (stockAdjustment ?? 0);

    if (finalStock < 0) {
      return { success: false, error: "Stock cannot be negative" };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        stock: finalStock,
      },
    });

    revalidatePath("/Inventory");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
