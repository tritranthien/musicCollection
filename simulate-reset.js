// simulate-reset.js
import { prisma } from "./app/utils/db.server.ts";
import crypto from "crypto";

async function simulateReset() {
    const email = "trantri1409@gmail.com";
    console.log(`🚀 Starting simulation for: ${email}`);

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error("❌ User not found!");
        return;
    }
    console.log(`✅ User found: ${user.id}`);

    // 2. Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    console.log(`🔑 Generated Token: ${resetToken}`);
    console.log(`⏰ Expiry: ${resetTokenExpiry.toISOString()}`);

    // 3. Update DB
    console.log("💾 Updating database...");
    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiry: resetTokenExpiry,
            },
        });
        console.log("✅ Database updated successfully!");
        console.log("   Stored Token:", updatedUser.resetPasswordToken);
        console.log("   Stored Expiry:", updatedUser.resetPasswordExpiry);

        if (updatedUser.resetPasswordToken !== resetToken) {
            console.error("❌ MISMATCH! Stored token does not match generated token.");
        } else {
            console.log("✅ Token matches!");
        }

    } catch (error) {
        console.error("❌ Database update failed:", error);
    }

    // 4. Verify immediately
    console.log("\n🔍 Verifying immediately...");
    const verifyUser = await prisma.user.findFirst({
        where: {
            resetPasswordToken: resetToken,
            resetPasswordExpiry: { gte: new Date() }
        }
    });

    if (verifyUser) {
        console.log("✅ Verification successful! User found with token.");
    } else {
        console.error("❌ Verification failed! User NOT found with token.");
    }
}

simulateReset().catch(console.error);
