import { prisma } from './src/lib/prisma.ts';

async function test() {
  try {
    const category = await prisma.category.create({
      data: { name: "Test Category" }
    });
    console.log("Created category:", category.id);
  } catch (e) {
    console.error("Error creating category:", e);
  }
}
test();
