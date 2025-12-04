import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("Password123!");

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: {},
    create: {
      name: "Demo Vendor",
      email: "vendor@example.com",
      passwordHash,
      role: "vendor",
    },
  });

  await prisma.vendorProfile.upsert({
    where: { userId: vendor.id },
    update: {},
    create: {
      userId: vendor.id,
      companyName: "Demo Vendor LLC",
      description: "Trusted supplier of premium goods.",
      website: "https://vendor.example.com",
      logo: "https://placehold.co/100x100",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      passwordHash,
      role: "customer",
    },
  });

  console.log(`Seeded users: ${vendor.email}, ${customer.email}`);

  await prisma.product.create({
    data: {
      vendorId: vendor.id,
      title: "Wireless Headphones",
      description:
        "Noise-cancelling over-ear headphones with 30h battery life.",
      price: 199.99,
      images: ["https://placehold.co/600x400"],
      category: "Electronics",
      stock: 25,
    },
  });

  await prisma.job.create({
    data: {
      vendorId: vendor.id,
      title: "Freelance Product Photographer",
      description:
        "Need a photographer to capture lifestyle shots for new catalog.",
      budget: 1200,
      category: "Creative",
      status: "open",
    },
  });

  await prisma.task.create({
    data: {
      vendorId: vendor.id,
      title: "Write Product Descriptions",
      description: "Create compelling copy for 10 new products.",
      price: 200,
      category: "Marketing",
      status: "pending",
      priority: "high",
    },
  });

  console.log("Seed data created.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
