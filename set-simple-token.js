// set-simple-token.js
import { prisma } from "./app/utils/db.server.ts";

async function setSimpleToken() {
    const email = "trantri1409@gmail.com";
    const simpleToken = "123456";

    console.log(`🚀 Setting simple token for: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    // Set token with 1 hour expiry
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: simpleToken,
            resetPasswordExpiry: new Date(Date.now() + 3600000),
        },
    });

    console.log("✅ Simple token set successfully!");
    console.log("👉 Use this link to reset password:");
    console.log(`   http://localhost:5173/reset-password?token=${simpleToken}`);
}

setSimpleToken().catch(console.error);
