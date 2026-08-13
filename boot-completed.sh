#!/system/bin/sh
MODDIR=${0%/*}

# KernelSU và APatch sẽ tự động gọi file này khi tiến trình khởi động hoàn tất (boot_completed = 1)
# Không cần dùng vòng lặp sleep như trên Magisk.

# Wait until boot animation is stopped to ensure framework is fully ready
while [ "$(getprop init.svc.bootanim)" != "stopped" ]; do
    sleep 1
done

# Apply persistent tweaks defined by the WebUI
if [ -f "$MODDIR/tweaks_boot.sh" ]; then
    chmod +x "$MODDIR/tweaks_boot.sh"
    sh "$MODDIR/tweaks_boot.sh"
fi
