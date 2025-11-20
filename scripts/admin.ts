// prisma/seed.js
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed database...');

  // Kiểm tra xem đã có ADMIN chưa
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('✅ ADMIN đã tồn tại:', existingAdmin.email);
    return;
  }

  // Tạo tài khoản ADMIN mặc định
  const adminPassword = process.env.ADMIN_PASSWORD || 'seven007';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@musiccollection.com',
      name: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      password: hashedPassword,
      emailVerified: true,
    }
  });

  console.log('✅ Đã tạo tài khoản ADMIN:');
  console.log('   Email:', admin.email);
  console.log('   Password:', adminPassword);
  console.log('   ⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
