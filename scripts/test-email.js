// scripts/test-email.js
// Script để test SMTP configuration

import dotenv from 'dotenv';
dotenv.config();

import {
    sendVerificationEmail,
    sendTeacherPendingEmail,
    sendTeacherApprovedEmail,
    sendTeacherRejectedEmail
} from '../app/service/email.server.js';

const testEmail = process.argv[2] || 'test@example.com';
const testName = process.argv[3] || 'Test User';

console.log('🧪 Testing Email Configuration...\n');
console.log(`📧 Sending test emails to: ${testEmail}\n`);

async function testAllEmails() {
    try {
        // Test 1: Verification Email
        console.log('1️⃣ Testing verification email...');
        const verifyResult = await sendVerificationEmail(
            testEmail,
            testName,
            'test-token-123456'
        );
        console.log(verifyResult.success ? '✅ Sent!' : '⚠️  Not sent (SMTP not configured)');
        console.log('');

        // Test 2: Teacher Pending Email
        console.log('2️⃣ Testing teacher pending email...');
        const pendingResult = await sendTeacherPendingEmail(testEmail, testName);
        console.log(pendingResult.success ? '✅ Sent!' : '⚠️  Not sent (SMTP not configured)');
        console.log('');

        // Test 3: Teacher Approved Email
        console.log('3️⃣ Testing teacher approved email...');
        const approvedResult = await sendTeacherApprovedEmail(testEmail, testName);
        console.log(approvedResult.success ? '✅ Sent!' : '⚠️  Not sent (SMTP not configured)');
        console.log('');

        // Test 4: Teacher Rejected Email
        console.log('4️⃣ Testing teacher rejected email...');
        const rejectedResult = await sendTeacherRejectedEmail(
            testEmail,
            testName,
            'Thông tin không đầy đủ'
        );
        console.log(rejectedResult.success ? '✅ Sent!' : '⚠️  Not sent (SMTP not configured)');
        console.log('');

        console.log('✅ All email tests completed!');
        console.log('\n📬 Check your inbox at:', testEmail);

    } catch (error) {
        console.error('❌ Error testing emails:', error.message);
        process.exit(1);
    }
}

testAllEmails();
