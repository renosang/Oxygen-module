#!/system/bin/sh
MODDIR=${0%/*}

# Wait until boot is completed
while [ "$(getprop sys.boot_completed)" != "1" ]; do
    sleep 2
done

# Sleep additional time to ensure system is fully ready
sleep 15

# Apply persistent tweaks defined by the WebUI
if [ -f "$MODDIR/tweaks_boot.sh" ]; then
    chmod +x "$MODDIR/tweaks_boot.sh"
    sh "$MODDIR/tweaks_boot.sh"
fi
