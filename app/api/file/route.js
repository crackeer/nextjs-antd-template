import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { getFileUploadDir } from '@/util/file';
import dayjs from 'dayjs';
export async function POST(request) {
  try {
    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: '没有提供文件' }, { status: 400 });
    }
    
    // 验证文件大小（限制为5MB）
    const maxSize = 5000 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小超过限制（最大5000MB）' }, { status: 400 });
    }
    
    // 创建上传目录（如果不存在）
    const uploadDir = getFileUploadDir();
    let relativePath = dayjs().format('YYYY-MM-DD');
    let relativeUploadDir = path.join(uploadDir, relativePath);
    if (!fs.existsSync(relativeUploadDir)) {
      fs.mkdirSync(relativeUploadDir, { recursive: true });
    }
    
    // 生成唯一文件名
    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = path.join(relativeUploadDir, uniqueName);
    
    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // 构建文件URL
    const fileUrl = `/api/file/${relativePath}/${uniqueName}`;
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ error: '文件上传失败', details: error.message }, { status: 500 });
  }
}
