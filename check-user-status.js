// check-user-status.js
import { prisma } from "./app/utils/db.server.ts";

async function checkUserStatus() {
    const email = "trantri1409@gmail.com";

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            email: true,
            name: true,
            role: true,
            status: true,
            emailVerified: true,
        }
    });

    if (!user) {
        console.log("❌ User not found!");
        return;
    }

    console.log("👤 User Information:");
    console.log("   Email:", user.email);
    console.log("   Name:", user.name);
    console.log("   Role:", user.role);
    console.log("   Status:", user.status);
    console.log("   Email Verified:", user.emailVerified);

    console.log("\n📋 Status Explanation:");
    if (user.status === "PENDING") {
        console.log("   ⚠️  PENDING - Waiting for admin approval");
    } else if (user.status === "APPROVED") {
        console.log("   ✅ APPROVED - Can login");
    } else if (user.status === "ACTIVE") {
        console.log("   ✅ ACTIVE - Can login");
    } else if (user.status === "REJECTED") {
        console.log("   ❌ REJECTED - Cannot login");
    }

    await prisma.$disconnect();
}

checkUserStatus().catch(console.error);
