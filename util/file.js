
export function getFileUploadDir() {
    return process.env.FILE_UPLOAD_DIR || '/tmp/nextjs/upload'
}