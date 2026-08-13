#!/system/bin/sh
MODDIR=${0%/*}

# Check if running in KernelSU or APatch environment
# KSU và APatch hỗ trợ boot-completed.sh gốc, nên ta không cần dùng service.sh để chờ.
if [ -n "$KSU" ] || [ -n "$APATCH" ]; then
    exit 0
fi

# Magisk fallback: Wait until boot is completed
while [ "$(getprop sys.boot_completed)" != "1" ]; do
    sleep 2
done

# Đợi cho đến khi Boot Animation tắt (chắc chắn framework và SystemUI đã lên)
while [ "$(getprop init.svc.bootanim)" != "stopped" ]; do
    sleep 2
done

# Apply persistent tweaks defined by the WebUI
if [ -f "$MODDIR/tweaks_boot.sh" ]; then
    chmod +x "$MODDIR/tweaks_boot.sh"
    sh "$MODDIR/tweaks_boot.sh"
fi
