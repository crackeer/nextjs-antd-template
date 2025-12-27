#!/bin/bash

# 设置定时任务脚本
# 用于配置自动化部署的cron任务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy.sh"
QUICK_DEPLOY_SCRIPT="$SCRIPT_DIR/quick-deploy.sh"

echo "设置自动化部署定时任务..."

# 检查脚本是否存在
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo "错误: 找不到部署脚本 $DEPLOY_SCRIPT"
    exit 1
fi

# 给脚本添加执行权限
chmod +x "$DEPLOY_SCRIPT"
chmod +x "$QUICK_DEPLOY_SCRIPT"

echo "选择部署频率:"
echo "1) 每5分钟检查一次 (开发环境)"
echo "2) 每30分钟检查一次"
echo "3) 每小时检查一次"
echo "4) 每天凌晨2点检查一次 (推荐生产环境)"
echo "5) 自定义"
echo "6) 仅设置执行权限，不添加定时任务"

read -p "请选择 (1-6): " choice

case $choice in
    1)
        CRON_SCHEDULE="*/5 * * * *"
        ;;
    2)
        CRON_SCHEDULE="*/30 * * * *"
        ;;
    3)
        CRON_SCHEDULE="0 * * * *"
        ;;
    4)
        CRON_SCHEDULE="0 2 * * *"
        ;;
    5)
        read -p "请输入cron表达式 (例: 0 2 * * *): " CRON_SCHEDULE
        ;;
    6)
        echo "已设置执行权限，可以手动运行:"
        echo "  完整版: $DEPLOY_SCRIPT"
        echo "  快速版: $QUICK_DEPLOY_SCRIPT"
        exit 0
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

# 创建cron任务
CRON_JOB="$CRON_SCHEDULE cd $SCRIPT_DIR && $DEPLOY_SCRIPT >> $SCRIPT_DIR/cron.log 2>&1"

# 添加到crontab
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "定时任务已添加:"
echo "$CRON_JOB"
echo ""
echo "查看当前定时任务:"
crontab -l
echo ""
echo "日志文件: $SCRIPT_DIR/cron.log"
echo "部署日志: $SCRIPT_DIR/deploy.log"
echo ""
echo "管理命令:"
echo "  查看定时任务: crontab -l"
echo "  编辑定时任务: crontab -e"
echo "  删除所有定时任务: crontab -r"
echo "  查看cron日志: tail -f $SCRIPT_DIR/cron.log"
echo "  查看部署日志: tail -f $SCRIPT_DIR/deploy.log"