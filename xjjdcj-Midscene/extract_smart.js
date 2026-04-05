const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgFolder = 'f:/code/xjjdcj/img';
const outputFolder = 'f:/code/xjjdcj/img/templateimg/final_precise';

// 创建输出文件夹
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// 智能边界查找算法
function findTightBounds(data, width, height, channels, startX, startY, searchW, searchH, bgTolerance = 30) {
    const pixels = [];
    
    // 首先在搜索区域收集非背景像素
    for (let y = startY; y < startY + searchH && y < height; y++) {
        for (let x = startX; x < startX + searchW && x < width; x++) {
            const idx = (y * width + x) * channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // 比较与左上角像素的差异来判断是否是背景
            const bgIdx = (startY * width + startX) * channels;
            const bgR = data[bgIdx];
            const bgG = data[bgIdx + 1];
            const bgB = data[bgIdx + 2];
            
            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
            
            if (diff > bgTolerance) {
                pixels.push({ x, y, r, g, b });
            }
        }
    }
    
    if (pixels.length === 0) return null;
    
    // 找到边界
    const minX = Math.min(...pixels.map(p => p.x));
    const maxX = Math.max(...pixels.map(p => p.x));
    const minY = Math.min(...pixels.map(p => p.y));
    const maxY = Math.max(...pixels.map(p => p.y));
    
    return {
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1
    };
}

// 配置每个模板的精确提取区域
const templateConfigs = [
    {
        file: '提取丢弃按钮.png',
        keyword: '丢弃按钮',
        searchArea: { x: 0.32, y: 0.72, w: 0.36, h: 0.20 },
        bgTolerance: 25
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '确定按钮',
        searchArea: { x: 0.30, y: 0.75, w: 0.40, h: 0.20 },
        bgTolerance: 25
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '胜利标题',
        searchArea: { x: 0.22, y: 0.03, w: 0.56, h: 0.25 },
        bgTolerance: 30
    },
    {
        file: '提取下一层、放弃挑战按钮.png',
        keyword: '放弃挑战按钮',
        searchArea: { x: 0.68, y: 0.82, w: 0.30, h: 0.15 },
        bgTolerance: 25
    },
    {
        file: '提取节点选择、路线、黄色箭头.png',
        keyword: '黄色箭头',
        searchArea: { x: 0.23, y: 0.18, w: 0.14, h: 0.22 },
        bgTolerance: 25
    }
];

console.log('开始智能精确提取模板...\n');

async function extractSmart() {
    for (const config of templateConfigs) {
        const imagePath = path.join(imgFolder, config.file);

        if (!fs.existsSync(imagePath)) {
            console.log(`文件不存在: ${config.file}`);
            continue;
        }

        console.log(`处理: ${config.keyword}`);
        console.log(`  文件: ${config.file}`);

        const { data, info } = await sharp(imagePath)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;
        const channels = info.channels;

        // 计算搜索区域
        const startX = Math.floor(width * config.searchArea.x);
        const startY = Math.floor(height * config.searchArea.y);
        const searchW = Math.floor(width * config.searchArea.w);
        const searchH = Math.floor(height * config.searchArea.h);

        console.log(`  搜索区域: (${startX}, ${startY}) ${searchW}x${searchH}`);

        // 查找紧边界
        const bounds = findTightBounds(data, width, height, channels, startX, startY, searchW, searchH, config.bgTolerance);

        if (!bounds) {
            console.log(`  ✗ 未找到有效区域\n`);
            continue;
        }

        // 添加小边距
        const padding = 3;
        const extractX = Math.max(0, bounds.x - padding);
        const extractY = Math.max(0, bounds.y - padding);
        const extractW = Math.min(width - extractX, bounds.w + padding * 2);
        const extractH = Math.min(height - extractY, bounds.h + padding * 2);

        console.log(`  提取区域: (${extractX}, ${extractY}) ${extractW}x${extractH}`);

        const outputFilename = `${config.keyword}_template.png`;
        const outputPath = path.join(outputFolder, outputFilename);

        await sharp(imagePath)
            .extract({ left: extractX, top: extractY, width: extractW, height: extractH })
            .toFile(outputPath);

        console.log(`  ✓ 已保存: ${outputFilename} (${extractW}x${extractH})`);

        await sharp(outputPath)
            .resize(extractW * 3, extractH * 3, { kernel: sharp.kernel.nearest })
            .toFile(path.join(outputFolder, `${config.keyword}_template_3x.png`));

        console.log('');
    }

    console.log('智能精确提取完成！');
    console.log(`输出文件夹: ${outputFolder}`);
}

extractSmart().catch(console.error);
