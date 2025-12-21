import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getFileUploadDir } from '@/util/file';

// 递归遍历目录，获取所有文件
function getAllFiles(directoryPath) {
  let files = [];
  
  // 检查目录是否存在
  if (!fs.existsSync(directoryPath)) {
    return files;
  }
  
  // 读取目录内容
  const items = fs.readdirSync(directoryPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directoryPath, item.name);
    
    if (item.isDirectory()) {
      // 递归处理子目录
      files = files.concat(getAllFiles(fullPath));
    } else {
      // 获取文件信息
      const stats = fs.statSync(fullPath);
      
      // 计算相对路径（相对于上传目录）
      const relativePath = path.relative(getFileUploadDir(), fullPath);
      
      // 构建文件URL（确保使用正斜杠）
      const fileUrl = `/api/file/${relativePath.split(path.sep).join('/')}`;
      
      // 添加文件信息到结果数组
      files.push({
        name: item.name,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: fullPath,
        relativePath,
        url: fileUrl
      });
    }
  }
  
  return files;
}

export async function GET() {
  try {
    const uploadDir = getFileUploadDir();
    
    // 获取所有文件列表
    const files = getAllFiles(uploadDir);
    
    // 按创建时间倒序排序
    files.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    return NextResponse.json({
      success: true,
      count: files.length,
      files
    }, { status: 200 });
  } catch (error) {
    console.error('获取文件列表错误:', error);
    return NextResponse.json({
      error: '获取文件列表失败',
      details: error.message
    }, { status: 500 });
  }
}