const nextConfig = {
  transpilePackages: ['@ant-design/icons', '@ant-design/icons-svg', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-tree', 'rc-table'],
  output: 'standalone', // 使用standalone模式支持服务器功能
}

module.exports = nextConfig
