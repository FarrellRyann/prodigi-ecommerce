import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length < 2) {
    console.log("Need at least 2 admins to test. Exiting.");
    return;
  }
  
  const adminA = admins[0];
  const adminB = admins[1];
  
  const tokenA = jwt.sign({ userId: adminA.id, email: adminA.email, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret123');
  const tokenB = jwt.sign({ userId: adminB.id, email: adminB.email, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret123');
  
  const resA = await fetch('http://localhost:8080/products/admin/mine', { headers: { Cookie: `token=${tokenA}` } });
  const dataA = await resA.json();
  console.log('Admin A (', adminA.username, ') Products:', dataA?.map ? dataA.map((p: any) => p.name) : dataA);
  
  const resB = await fetch('http://localhost:8080/products/admin/mine', { headers: { Cookie: `token=${tokenB}` } });
  const dataB = await resB.json();
  console.log('Admin B (', adminB.username, ') Products:', dataB?.map ? dataB.map((p: any) => p.name) : dataB);
}

run().catch(console.error).finally(() => prisma.$disconnect());
