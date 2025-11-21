// Debug script to check reset token in database
import { prisma } from "./app/utils/db.server.ts";

async function checkResetToken() {
    const email = process.argv[2] || "trantri1409@gmail.com";

    console.log(`🔍 Checking reset token for: ${email}\n`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            resetPasswordToken: true,
            resetPasswordExpiry: true,
        }
    });

    if (!user) {
        console.log("❌ User not found!");
        return;
    }

    console.log("✅ User found:");
    console.log("   ID:", user.id);
    console.log("   Email:", user.email);
    console.log("   Name:", user.name);
    console.log("   Reset Token:", user.resetPasswordToken || "NULL");
    console.log("   Token Expiry:", user.resetPasswordExpiry || "NULL");

    if (user.resetPasswordToken) {
        const now = new Date();
        const expiry = new Date(user.resetPasswordExpiry);
        const isExpired = now > expiry;

        console.log("\n⏰ Token Status:");
        console.log("   Current Time:", now.toISOString());
        console.log("   Expiry Time:", expiry.toISOString());
        console.log("   Is Expired:", isExpired ? "YES ❌" : "NO ✅");

        if (!isExpired) {
            const resetUrl = `http://localhost:5173/reset-password?token=${user.resetPasswordToken}`;
            console.log("\n🔗 Reset URL:");
            console.log("   ", resetUrl);
        }
    } else {
        console.log("\n⚠️  No reset token found for this user");
    }

    await prisma.$disconnect();
}

checkResetToken().catch(console.error);
