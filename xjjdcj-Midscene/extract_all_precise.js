const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgFolder = 'f:/code/xjjdcj/img';
const outputFolder = 'f:/code/xjjdcj/img/templateimg/final_precise';

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function findTightBounds(data, width, height, channels, startX, startY, searchW, searchH, bgTolerance = 30) {
    const pixels = [];
    
    for (let y = startY; y < startY + searchH && y < height; y++) {
        for (let x = startX; x < startX + searchW && x < width; x++) {
            const idx = (y * width + x) * channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
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

const templateConfigs = [
    {
        file: '提取丢弃按钮.png',
        keyword: '丢弃按钮',
        searchArea: { x: 0.30, y: 0.70, w: 0.40, h: 0.25 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '确定按钮',
        searchArea: { x: 0.28, y: 0.72, w: 0.44, h: 0.25 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取胜利标题、确定按钮.png',
        keyword: '胜利标题',
        searchArea: { x: 0.20, y: 0.02, w: 0.60, h: 0.28 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '提取下一层、放弃挑战按钮.png',
        keyword: '放弃挑战按钮',
        searchArea: { x: 0.66, y: 0.80, w: 0.32, h: 0.18 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取下一层、放弃挑战按钮.png',
        keyword: '下一层',
        searchArea: { x: 0.02, y: 0.80, w: 0.32, h: 0.18 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取节点选择、路线、黄色箭头.png',
        keyword: '黄色箭头',
        searchArea: { x: 0.20, y: 0.15, w: 0.20, h: 0.28 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取节点选择、路线、黄色箭头.png',
        keyword: '节点选择',
        searchArea: { x: 0.10, y: 0.02, w: 0.80, h: 0.15 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '提取赛季事件、选择窗体.png',
        keyword: '赛季事件',
        searchArea: { x: 0.20, y: 0.02, w: 0.60, h: 0.28 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '提取赛季事件、选择窗体.png',
        keyword: '选择窗体',
        searchArea: { x: 0.02, y: 0.02, w: 0.96, h: 0.96 },
        bgTolerance: 30,
        padding: 5,
        extractWhole: true
    },
    {
        file: '提取稀有事件标题、事件选择窗体.png',
        keyword: '事件选择窗体',
        searchArea: { x: 0.02, y: 0.02, w: 0.96, h: 0.96 },
        bgTolerance: 30,
        padding: 5,
        extractWhole: true
    },
    {
        file: '提取神圣羽毛标题.png',
        keyword: '神圣羽毛标题',
        searchArea: { x: 0.20, y: 0.02, w: 0.60, h: 0.28 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '提取神器选择标题.png',
        keyword: '神器选择标题',
        searchArea: { x: 0.20, y: 0.02, w: 0.60, h: 0.28 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '提取红色冒险按钮、舰队图标.png',
        keyword: '舰队图标',
        searchArea: { x: 0.02, y: 0.02, w: 0.25, h: 0.25 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '提取队长选择标题和角色位置标题.png',
        keyword: '队长选择标题',
        searchArea: { x: 0.20, y: 0.02, w: 0.60, h: 0.28 },
        bgTolerance: 30,
        padding: 5
    },
    {
        file: '结束商城购买确定按钮.png',
        keyword: '结束商城购买确定按钮',
        searchArea: { x: 0.28, y: 0.72, w: 0.44, h: 0.25 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '遗迹节点-挑战和放弃挑战.png',
        keyword: '挑战按钮',
        searchArea: { x: 0.02, y: 0.80, w: 0.32, h: 0.18 },
        bgTolerance: 25,
        padding: 3
    },
    {
        file: '遗迹节点-挑战和放弃挑战.png',
        keyword: '放弃挑战按钮遗迹',
        searchArea: { x: 0.66, y: 0.80, w: 0.32, h: 0.18 },
        bgTolerance: 25,
        padding: 3
    }
];

console.log('开始精确提取所有模板...\n');

async function extractAllPrecise() {
    for (const config of templateConfigs) {
        const imagePath = path.join(imgFolder, config.file);

        if (!fs.existsSync(imagePath)) {
            console.log(`❌ 文件不存在: ${config.file}`);
            continue;
        }

        console.log(`📦 处理: ${config.keyword}`);
        console.log(`   文件: ${config.file}`);

        const { data, info } = await sharp(imagePath)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;
        const channels = info.channels;

        const startX = Math.floor(width * config.searchArea.x);
        const startY = Math.floor(height * config.searchArea.y);
        const searchW = Math.floor(width * config.searchArea.w);
        const searchH = Math.floor(height * config.searchArea.h);

        console.log(`   搜索区域: (${startX}, ${startY}) ${searchW}x${searchH}`);

        let extractX, extractY, extractW, extractH;
        
        if (config.extractWhole) {
            extractX = startX;
            extractY = startY;
            extractW = searchW;
            extractH = searchH;
        } else {
            const bounds = findTightBounds(data, width, height, channels, startX, startY, searchW, searchH, config.bgTolerance);

            if (!bounds) {
                console.log(`   ✗ 未找到有效区域\n`);
                continue;
            }

            const padding = config.padding;
            extractX = Math.max(0, bounds.x - padding);
            extractY = Math.max(0, bounds.y - padding);
            extractW = Math.min(width - extractX, bounds.w + padding * 2);
            extractH = Math.min(height - extractY, bounds.h + padding * 2);
        }

        console.log(`   提取区域: (${extractX}, ${extractY}) ${extractW}x${extractH}`);

        const outputFilename = `${config.keyword}_template.png`;
        const outputPath = path.join(outputFolder, outputFilename);

        await sharp(imagePath)
            .extract({ left: extractX, top: extractY, width: extractW, height: extractH })
            .toFile(outputPath);

        console.log(`   ✓ 已保存: ${outputFilename} (${extractW}x${extractH})`);

        await sharp(outputPath)
            .resize(extractW * 3, extractH * 3, { kernel: sharp.kernel.nearest })
            .toFile(path.join(outputFolder, `${config.keyword}_template_3x.png`));

        console.log('');
    }

    console.log('✅ 所有模板精确提取完成！');
    console.log(`📂 输出文件夹: ${outputFolder}`);
}

extractAllPrecise().catch(console.error);
