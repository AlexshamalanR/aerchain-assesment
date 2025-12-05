import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.proposal.deleteMany({});
  await prisma.rfp.deleteMany({});
  await prisma.vendor.deleteMany({});

  // Seed vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: "TechCorp Solutions",
      email: "sales@techcorp.com",
      contactName: "John Smith",
      phone: "+1-555-0101",
      notes: "Reliable vendor, fast delivery",
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: "Global Hardware Inc",
      email: "bids@globalhw.com",
      contactName: "Alice Johnson",
      phone: "+1-555-0202",
      notes: "Competitive pricing",
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      name: "Premium Tech Solutions",
      email: "proposals@premiumtech.com",
      contactName: "Bob Wilson",
      phone: "+1-555-0303",
      notes: "High-quality products",
    },
  });

  console.log("✅ Vendors created:", { vendor1: vendor1.name, vendor2: vendor2.name, vendor3: vendor3.name });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seeding complete!");
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
