import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, adminId: true } });
  console.log("Products:");
  console.table(products);
}

run();
