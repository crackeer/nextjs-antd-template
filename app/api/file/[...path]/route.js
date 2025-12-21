import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getFileUploadDir } from '@util/file';

export async function GET(request, params) {
  try {
    const slug = await params.params;
    const filePath = slug.path.join('/');
    
    // 验证文件路径，防止路径遍历攻击
    if (filePath.includes('..')) {
      return NextResponse.json({ error: '无效的文件路径' }, { status: 400 });
    }
    
    const uploadDir = getFileUploadDir();
    const fullPath = path.join(uploadDir, filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
    
    // 获取文件信息
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: '路径不是文件' }, { status: 400 });
    }
    
    // 读取文件内容
    const fileContent = fs.readFileSync(fullPath);
    
    // 设置响应头
    const headers = {
      'Content-Length': stats.size,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filePath)}"`,
    };
    
    // 返回文件内容
    return new NextResponse(fileContent, { headers });
  } catch (error) {
    console.error('文件获取错误:', error);
    return NextResponse.json({ error: '文件获取失败', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, params) {
  try {
    const slug = await params.params;
    const filePath = slug.path.join('/');
    
    // 验证文件路径，防止路径遍历攻击
    if (filePath.includes('..')) {
      return NextResponse.json({ error: '无效的文件路径' }, { status: 400 });
    }
    
    const uploadDir = getFileUploadDir();
    const fullPath = path.join(uploadDir, filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
    
    // 获取文件信息
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: '路径不是文件' }, { status: 400 });
    }
    
    // 删除文件
    fs.unlinkSync(fullPath);
    
    return NextResponse.json({ success: true, message: '文件删除成功' }, { status: 200 });
  } catch (error) {
    console.error('文件删除错误:', error);
    return NextResponse.json({ error: '文件删除失败', details: error.message }, { status: 500 });
  }
}
