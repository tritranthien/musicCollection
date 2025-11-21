// approve-user.js
import { prisma } from "./app/utils/db.server.ts";

async function approveUser() {
    const email = "trantri1409@gmail.com";

    console.log(`🚀 Approving user: ${email}`);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            status: "APPROVED",
            emailVerified: true,
        },
    });

    console.log("✅ User approved successfully!");
    console.log("   Email:", updatedUser.email);
    console.log("   Role:", updatedUser.role);
    console.log("   Status:", updatedUser.status);
    console.log("   Email Verified:", updatedUser.emailVerified);
    console.log("\n👉 You can now login!");

    await prisma.$disconnect();
}

approveUser().catch(console.error);
