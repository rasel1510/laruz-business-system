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

    // Auto-generate category-based product code (e.g., "Rings 00001", "Earrings 00002")
    const categoryPrefix = validated.category.trim();

    // Find the highest existing code number for this category
    const existingProducts = await prisma.product.findMany({
      where: {
        code: {
          startsWith: `${categoryPrefix} `,
        },
      },
      select: { code: true },
    });

    let nextNumber = 1;
    for (const p of existingProducts) {
      const match = p.code.match(new RegExp(`^${categoryPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (\\d+)$`));
      if (match) {
        const num = parseInt(match[1]);
        if (num >= nextNumber) {
          nextNumber = num + 1;
        }
      }
    }

    const code = `${categoryPrefix} ${nextNumber.toString().padStart(5, "0")}`;

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

export async function getNextProductCode(category?: string) {
  try {
    if (!category || !category.trim()) {
      return "Select a category first";
    }

    const categoryPrefix = category.trim();

    // Find the highest existing code number for this category
    const existingProducts = await prisma.product.findMany({
      where: {
        code: {
          startsWith: `${categoryPrefix} `,
        },
      },
      select: { code: true },
    });

    let nextNumber = 1;
    for (const p of existingProducts) {
      const match = p.code.match(new RegExp(`^${categoryPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (\\d+)$`));
      if (match) {
        const num = parseInt(match[1]);
        if (num >= nextNumber) {
          nextNumber = num + 1;
        }
      }
    }

    return `${categoryPrefix} ${nextNumber.toString().padStart(5, "0")}`;
  } catch (error) {
    console.error("Failed to get next product code:", error);
    return "Error generating code";
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
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/Inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
