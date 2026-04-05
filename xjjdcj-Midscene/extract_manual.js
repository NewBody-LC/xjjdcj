const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgFolder = 'f:/code/xjjdcj/img';
const outputFolder = 'f:/code/xjjdcj/img/templateimg/final';

// 创建输出文件夹
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// 手动精确定义的提取区域
const manualExtractions = [
    {
        file: '提取丢弃按钮.png',
        keyword: '丢弃按钮',
        area: { x: 350, y: 540, w: 220, h: 80 }
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '确定按钮',
        area: { x: 290, y: 560, w: 200, h: 70 }
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '胜利标题',
        area: { x: 250, y: 50, w: 280, h: 90 }
    },
    {
        file: '提取下一层、放弃挑战按钮.png',
        keyword: '放弃挑战按钮',
        area: { x: 480, y: 540, w: 170, h: 50 }
    },
    {
        file: '提取节点选择、路线、黄色箭头.png',
        keyword: '黄色箭头',
        area: { x: 0, y: 380, w: 140, h: 160 }
    },
    {
        file: '提取红色冒险按钮、舰队图标.png',
        keyword: '舰队图标',
        area: { x: 500, y: 520, w: 100, h: 100 }
    }
];

console.log('开始手动精确提取...\n');

async function extractManual() {
    for (const extraction of manualExtractions) {
        const imagePath = path.join(imgFolder, extraction.file);

        if (!fs.existsSync(imagePath)) {
            console.log(`文件不存在: ${extraction.file}`);
            continue;
        }

        const { info } = await sharp(imagePath).metadata();
        const width = info.width;
        const height = info.height;

        console.log(`处理: ${extraction.file}`);
        console.log(`  提取: ${extraction.keyword}`);
        console.log(`  区域: (${extraction.area.x}, ${extraction.area.y}) ${extraction.area.w}x${extraction.area.h}`);

        // 确保区域在图片范围内
        const extractX = Math.max(0, extraction.area.x);
        const extractY = Math.max(0, extraction.area.y);
        const extractW = Math.min(width - extractX, extraction.area.w);
        const extractH = Math.min(height - extractY, extraction.area.h);

        const outputFilename = `${extraction.keyword}_template.png`;
        const outputPath = path.join(outputFolder, outputFilename);

        await sharp(imagePath)
            .extract({ left: extractX, top: extractY, width: extractW, height: extractH })
            .toFile(outputPath);

        console.log(`  ✓ 已保存: ${outputFilename} (${extractW}x${extractH})`);

        await sharp(outputPath)
            .resize(extractW * 3, extractH * 3, { kernel: sharp.kernel.nearest })
            .toFile(path.join(outputFolder, `${extraction.keyword}_template_3x.png`));

        console.log('');
    }

    console.log('手动精确提取完成！');
    console.log(`输出文件夹: ${outputFolder}`);
}

extractManual().catch(console.error);
