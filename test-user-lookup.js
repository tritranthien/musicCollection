// Test script to check if user exists
import { prisma } from "./app/utils/db.server.js";

async function testUserLookup() {
    const email = "trantri1409@gmail.com";

    console.log("🔍 Searching for user with email:", email);

    // Try exact match
    const user1 = await prisma.user.findUnique({ where: { email } });
    console.log("Exact match result:", user1 ? "FOUND ✅" : "NOT FOUND ❌");
    if (user1) {
        console.log("User details:", {
            id: user1.id,
            email: user1.email,
            name: user1.name,
            role: user1.role,
        });
    }

    // Try case-insensitive search
    const user2 = await prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: 'insensitive'
            }
        }
    });
    console.log("\nCase-insensitive search:", user2 ? "FOUND ✅" : "NOT FOUND ❌");
    if (user2) {
        console.log("User details:", {
            id: user2.id,
            email: user2.email,
            name: user2.name,
            role: user2.role,
        });
    }

    // List all users
    const allUsers = await prisma.user.findMany({
        select: {
            email: true,
            name: true,
            role: true,
        },
        take: 10,
    });

    console.log("\n📋 First 10 users in database:");
    allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} (${u.name}) - ${u.role}`);
    });

    await prisma.$disconnect();
}

testUserLookup().catch(console.error);
