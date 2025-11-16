// scripts/migrate-updatedAt.js
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function migrateUpdatedAt() {
  try {
    console.log('Starting migration...');

    // Update Users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to update`);
    
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          updatedAt: user.createdAt // Set updatedAt = createdAt cho dữ liệu cũ
        }
      });
    }

    // Update Files
    const files = await prisma.file.findMany();
    console.log(`Found ${files.length} files to update`);
    
    for (const file of files) {
      await prisma.file.update({
        where: { id: file.id },
        data: { 
          updatedAt: file.createdAt
        }
      });
    }

    // Update Categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories to update`);
    
    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: { 
          updatedAt: category.createdAt
        }
      });
    }

    // Update Lessons
    const lessons = await prisma.lesson.findMany();
    console.log(`Found ${lessons.length} lessons to update`);
    
    for (const lesson of lessons) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { 
          updatedAt: lesson.createdAt
        }
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUpdatedAt();