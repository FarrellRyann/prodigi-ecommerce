import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, adminId: true }});
  console.log("DB Products:", products);
}
test();
