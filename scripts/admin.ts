import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const name = process.argv[3] || "Administrator";

  if (!email) {
    console.error("❌ Missing email argument. Example:");
    console.error("   npm run create-admin admin@example.com 'Admin User'");
    process.exit(1);
  }

  const password = "seven007";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️ User with email ${email} already exists.`);
    process.exit(0);
  }

  const admin = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "ADMIN" },
  });

  console.log("✅ Admin created successfully!");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
