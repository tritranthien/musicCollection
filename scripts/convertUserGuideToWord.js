import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import HTMLtoDOCX from 'html-to-docx';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertMarkdownToWord() {
    try {
        console.log('📖 Đọc file USER_GUIDE.md...');

        // Đọc file markdown
        const markdownPath = path.join(__dirname, '..', 'USER_GUIDE.md');
        const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

        console.log('🔄 Chuyển đổi Markdown sang HTML...');

        // Convert markdown to HTML
        const htmlContent = marked(markdownContent);

        // Tạo HTML document hoàn chỉnh với styling
        const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 30px;
            font-size: 28px;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 8px;
            margin-top: 25px;
            font-size: 22px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 20px;
            font-size: 18px;
        }
        h4 {
            color: #95a5a6;
            margin-top: 15px;
            font-size: 16px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            overflow-x: auto;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-left: 0;
            color: #7f8c8d;
            font-style: italic;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        table th,
        table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        table th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        strong {
            color: #2c3e50;
            font-weight: bold;
        }
        em {
            color: #7f8c8d;
            font-style: italic;
        }
        p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>
        `;

        console.log('📄 Chuyển đổi HTML sang Word...');

        // Convert HTML to DOCX
        const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
            table: {
                row: { cantSplit: true }
            },
            footer: true,
            pageNumber: true,
            font: 'Arial',
            fontSize: 11,
            orientation: 'portrait',
            margins: {
                top: 1440,    // 1 inch = 1440 twips
                right: 1440,
                bottom: 1440,
                left: 1440,
            }
        });

        // Lưu file
        const outputPath = path.join(__dirname, '..', 'USER_GUIDE.docx');
        fs.writeFileSync(outputPath, docxBuffer);

        console.log('✅ Hoàn thành! File đã được lưu tại:');
        console.log('   ', outputPath);
        console.log('');
        console.log('📊 Thông tin:');
        console.log('   - Kích thước:', Math.round(docxBuffer.length / 1024), 'KB');
        console.log('   - Định dạng: Microsoft Word (.docx)');
        console.log('');
        console.log('🎉 Bạn có thể mở file bằng Microsoft Word hoặc Google Docs!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Chạy conversion
convertMarkdownToWord();
