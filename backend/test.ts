import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { env } from './src/config/env.ts';

const prisma = new PrismaClient();

async function run() {
  // Get all admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length < 2) {
    console.log("Need at least 2 admins to test");
    return;
  }
  
  const adminA = admins[0];
  const adminB = admins[1];
  
  // Make tokens
  const tokenA = jwt.sign({ userId: adminA.id, email: adminA.email, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret123');
  const tokenB = jwt.sign({ userId: adminB.id, email: adminB.email, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret123');
  
  const resA = await axios.get('http://localhost:8080/products/admin/mine', { headers: { Cookie: `token=${tokenA}` } });
  console.log('Admin A Products:', resA.data.map(p => p.name));
  
  const resB = await axios.get('http://localhost:8080/products/admin/mine', { headers: { Cookie: `token=${tokenB}` } });
  console.log('Admin B Products:', resB.data.map(p => p.name));
}

run().catch(console.error).finally(() => prisma.$disconnect());
