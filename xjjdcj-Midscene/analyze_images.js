const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgFolder = 'f:/code/xjjdcj/img';

const imageFiles = [
    '提取下一层、放弃挑战按钮.png',
    '提取丢弃按钮.png',
    '提取神器选择标题.png',
    '提取神圣羽毛标题.png',
    '提取稀有事件标题、事件选择窗体.png',
    '提取红色冒险按钮、舰队图标.png',
    '提取胜利标题、确定按钮.png',
    '提取节点选择、路线、黄色箭头.png',
    '提取赛季事件、选择窗体.png',
    '提取队长选择标题和角色位置标题.png',
    '紫色BOSS节点.png',
    '结束商城购买确定按钮.png',
    '遗迹节点-挑战和放弃挑战.png'
];

async function analyzeAllImages() {
    console.log('分析所有原始图片...\n');
    
    for (const file of imageFiles) {
        const filePath = path.join(imgFolder, file);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ 文件不存在: ${file}`);
            continue;
        }
        
        try {
            const metadata = await sharp(filePath).metadata();
            console.log(`✅ ${file}`);
            console.log(`   尺寸: ${metadata.width}x${metadata.height}`);
            console.log(`   格式: ${metadata.format}`);
            console.log('');
        } catch (e) {
            console.log(`❌ 分析失败: ${file}`);
            console.log(`   错误: ${e.message}`);
            console.log('');
        }
    }
}

analyzeAllImages().catch(console.error);
