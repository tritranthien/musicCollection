// scripts/check-smtp-config.js
// Script để kiểm tra SMTP configuration

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Checking SMTP Configuration...\n');

const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
];

let allConfigured = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName === 'SMTP_PASS' ? '***' : value}`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
        allConfigured = false;
    }
});

console.log('\nOptional variables:');
console.log(`   SMTP_SECURE: ${process.env.SMTP_SECURE || 'false (default)'}`);
console.log(`   SMTP_FROM_NAME: ${process.env.SMTP_FROM_NAME || 'Not set'}`);
console.log(`   SMTP_FROM_EMAIL: ${process.env.SMTP_FROM_EMAIL || 'Not set'}`);
console.log(`   APP_URL: ${process.env.APP_URL || 'Not set'}`);

console.log('\n' + '='.repeat(50));

if (allConfigured) {
    console.log('✅ SMTP is configured! You can send emails.');
} else {
    console.log('❌ SMTP is NOT configured. Missing required variables.');
    console.log('\nAdd these to your .env file:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASS=your-app-password');
}
