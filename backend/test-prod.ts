import { prisma } from './src/lib/prisma.ts';
import { createProduct } from './src/services/product.service.ts';

async function test() {
  try {
    const product = await createProduct({
      categoryId: "b081d2df-8eb3-439d-8afd-6f95a9556c86",
      name: "Test Ebook",
      description: "Book",
      price: 1500,
    });
    console.log("Created product:", product.id);
  } catch (e) {
    console.error("Error creating product:", e);
  }
}
test();
