const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testRemoveBackgroundAPI() {
  try {
    // 读取测试图像
    const testImagePath = path.join(__dirname, '..', '..', 'public', 'tree.jpg');
    const testImageBuffer = fs.readFileSync(testImagePath);

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('file', testImageBuffer, 'tree.jpg');

    // 发送请求到 API
    const response = await fetch('https://api-back.cashzineapp.com/removebg', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    // 获取响应数据
    const resultBuffer = await response.buffer();

    // 检查响应
    if (resultBuffer.length === 0) {
      throw new Error('返回的图像为空');
    }

    console.log('API 测试成功！');
    console.log(`原始图像大小: ${testImageBuffer.length} 字节`);
    console.log(`处理后图像大小: ${resultBuffer.length} 字节`);

    // 保存处理后的图像
    const outputPath = path.join(__dirname, 'resources/output', 'tree_remove.jpg');
    fs.writeFileSync(outputPath, resultBuffer);
    console.log(`处理后的图像已保存到: ${outputPath}`);

  } catch (error) {
    console.error('API 测试失败:', error);
  }
}

// 运行测试
testRemoveBackgroundAPI();