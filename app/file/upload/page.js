'use client'
import React, { useState, useEffect } from 'react';
import { Button, Upload, List, message, Progress, Spin, Modal } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const FileUploadPage = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalApi, modalContext] = Modal.useModal()

    // 统一的获取文件列表函数
    const fetchAllFiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/file/list');

            if (response.data.success) {
                const files = response.data.files.map((file, index) => ({
                    uid: Date.now() + index,
                    name: file.name,
                    url: file.url,
                    size: file.size,
                    type: file.name.split('.').pop() || 'unknown',
                    created: file.created,
                    modified: file.modified,
                    relativePath: file.relativePath
                }));
                setUploadedFiles(files);
            } else {
                message.error('获取文件列表失败');
            }
        } catch (error) {
            console.error('Fetch files error:', error);
            message.error('获取文件列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 页面加载时获取所有文件
    useEffect(() => {
        fetchAllFiles();
    }, []);

    // 处理文件上传
    const handleUpload = async (fileList) => {
        if (fileList.length === 0) {
            message.warning('请选择要上传的文件');
            return;
        }

        setUploading(true);
        setProgress(0);
        let successCount = 0;

        try {
            // 逐个上传文件
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i].originFileObj;
                const formData = new FormData();
                formData.append('file', file);

                // 模拟进度更新
                setProgress(Math.round(((i + 1) / fileList.length) * 100));

                // 上传文件
                const response = await axios.post('/api/file', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    successCount++;
                }
            }

            // 上传完成后更新文件列表
            await fetchAllFiles();
            message.success(`成功上传 ${successCount} 个文件`);

            // 上传完成后清空选择的文件列表
            setSelectedFiles([]);
        } catch (error) {
            message.error('文件上传失败');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    // 处理文件下载
    const handleDownload = (file) => {
        window.open(file.url, '_blank');
    };

    // 处理文件删除
    const handleDelete = async (uid) => {
        const fileToDelete = uploadedFiles.find(file => file.uid === uid);
        if (!fileToDelete) return;

        modalApi.confirm({
            title: '确认删除',
            content: `确定要删除文件 "${fileToDelete.name}" 吗？`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    // 从URL中提取文件路径（或使用relativePath）
                    const filePath = fileToDelete.relativePath;

                    // 发送DELETE请求
                    await axios.delete(`/api/file/${filePath}`);

                    // 删除完成后更新文件列表
                    await fetchAllFiles();
                    message.success('文件删除成功');
                } catch (error) {
                    console.error('Delete file error:', error);
                    message.error('文件删除失败');
                }
            }
        });
    };

    // 注意：已移除清空所有文件功能，避免误操作导致服务器文件丢失
    // 如果需要批量删除文件，请逐个点击删除按钮

    // 文件列表渲染
    const renderFileList = () => {
        return (
            <List
                className="file-list"
                bordered
                dataSource={uploadedFiles}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(item)}
                            >
                                下载
                            </Button>,
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(item.uid)}
                            >
                                删除
                            </Button>,
                        ]}
                    >
                        <List.Item.Meta
                            title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                            description={`${item.type || 'unknown'} • ${(item.size / 1024).toFixed(2)} KB • 路径: ${item.relativePath || '/'}`}
                        />
                    </List.Item>
                )}
            />
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Upload
                    multiple
                    beforeUpload={() => false} // 禁用自动上传
                    fileList={selectedFiles}
                    onChange={(info) => setSelectedFiles(info.fileList)}
                    onRemove={(file) => {
                        setSelectedFiles(prevFiles => prevFiles.filter(f => f.uid !== file.uid));
                    }}
                >
                    <Button type="primary" icon={<UploadOutlined />}>
                        选择文件
                    </Button>
                </Upload>

                <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    style={{ marginTop: '10px' }}
                    onClick={() => handleUpload(selectedFiles)}
                    loading={uploading}
                    disabled={selectedFiles.length === 0 || uploading}
                >
                    {uploading ? '上传中...' : '上传文件'}
                </Button>

                {uploading && (
                    <Progress
                        percent={progress}
                        status="active"
                        style={{ marginTop: '10px' }}
                    />
                )}
            </div>

            <div>
                <div style={{ marginBottom: '10px' }}>
                    <h3>已上传文件 ({uploadedFiles.length})</h3>
                </div>
                <Spin spinning={loading} tip="加载文件列表中...">
                    {renderFileList()}
                </Spin>
            </div>
            {modalContext}
        </div>
    );
};

export default FileUploadPage;