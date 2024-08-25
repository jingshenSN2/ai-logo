import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('收到背景移除请求');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('没有提供文件');
      return NextResponse.json({ error: '没有提供文件' }, { status: 400 });
    }

    console.log('文件已接收，准备发送到外部 API');

    // 创建一个新的 FormData 对象来发送到外部 API
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    // 发送请求到外部 API
    console.log('正在发送请求到外部 API');
    const apiResponse = await fetch('https://api-back.cashzineapp.com/removebg', {
      method: 'POST',
      body: apiFormData,
    });

    console.log('收到外部 API 响应:', apiResponse.status, apiResponse.statusText);

    if (!apiResponse.ok) {
      throw new Error(`API 请求失败: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    // 获取 API 响应的内容类型
    const contentType = apiResponse.headers.get('content-type');

    // 创建一个 NextResponse 对象，将 API 的响应直接传递给客户端
    const response = new NextResponse(apiResponse.body);

    // 设置正确的内容类型
    if (contentType) {
      response.headers.set('content-type', contentType);
    }

    console.log('成功处理请求，返回响应');
    return response;

  } catch (error) {
    console.error('移除背景时出错:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '移除背景失败', details: errorMessage }, { status: 500 });
  }
}