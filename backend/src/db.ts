import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  console.log("✅ Disconnected from database");
}
