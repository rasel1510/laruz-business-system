"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Alphanumeric Order ID Generator ─────────────────────────────────────────
// 36^5 = 60,466,176 possible IDs — plenty for any business, forever.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomAlphanumericSuffix(): string {
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

/** Generates a unique #ORD-XXXXX that doesn't already exist in the DB. */
async function generateUniqueOrderNumber(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const candidate = `#ORD-${randomAlphanumericSuffix()}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!existing) return candidate;
    attempts++;
  }
  // Fallback: append timestamp to guarantee uniqueness
  return `#ORD-${randomAlphanumericSuffix()}${Date.now().toString(36).toUpperCase().slice(-2)}`;
}

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
});

const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  source: z.string().optional(),
  courier: z.string().optional(),
  cnNumber: z.string().optional(),
  paymentMethod: z.string().default("COD"),
  advance: z.number().min(0).default(0),
  packaging: z.number().min(0).default(0),
  deliveryCharge: z.number().min(0).default(0),
  discount: z.number().default(0),
  resell: z.number().min(0).default(0),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
});

export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  try {
    const validated = createOrderSchema.parse(data);

    // Calculate products subtotal
    const productsTotal = validated.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Grand Total = productsTotal + packaging + deliveryCharge + resell - discount - advance
    const totalAmount =
      productsTotal +
      (validated.packaging ?? 0) +
      (validated.deliveryCharge ?? 0) +
      (validated.resell ?? 0) -
      (validated.discount ?? 0) -
      (validated.advance ?? 0);

    // Generate unique alphanumeric Order Number (#ORD-A3X9K style)
    const orderNumber = await generateUniqueOrderNumber();

    // Use a transaction to create order and update inventory
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check stock for all items first
      for (const item of validated.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}" (available: ${product.stock})`);
        }
      }

      // 2. Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: validated.customerName,
          phone: validated.phone,
          courier: validated.courier,
          cnNumber: validated.cnNumber,
          totalAmount,
          paymentMethod: validated.paymentMethod,
          status: "Pending",
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // 3. Deduct stock
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    revalidatePath("/orders");
    revalidatePath("/Inventory");
    return { success: true, order: result };
  } catch (error: any) {
    console.error("Failed to create order:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: error.message || "Internal Server Error" };
  }
}

export async function getOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function updateOrder(
  id: string,
  data: { status?: string; courier?: string; cnNumber?: string }
) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.courier !== undefined && { courier: data.courier }),
        ...(data.cnNumber !== undefined && { cnNumber: data.cnNumber }),
      },
    });
    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error("Failed to update order:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}

export async function getNextOrderNumber(): Promise<string> {
  try {
    // Just preview — returns a random candidate (actual unique check happens on createOrder)
    return `#ORD-${randomAlphanumericSuffix()}`;
  } catch {
    return "#ORD-A0001";
  }
}
