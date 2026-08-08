#!/system/bin/sh

# Проверка: запускается ли скрипт от root
[ "$(id -u)" != "0" ] && exit 1

MODDIR=${0%/*}
MODPATH="$MODDIR"

# KernelSU/Magisk natively handles system/ overlayfs.
# Manual bind mounting is removed to fix SELinux context issues with sysconfig XMLs.

# Обработка extension-файлов
for dir in /my_product/etc/extension/ /my_region/etc/extension/ /my_bigball/etc/extension; do
    [ -d "$dir" ] || continue
    grep -rl -e 'no_display_record' -e 'support_record_prompt' -e 'not_support_record' -e 'disable_ted_function' "$dir" 2>/dev/null | while IFS= read -r disrec; do
        rel="${disrec#/}"                     # без ведущего /
        modfile="$MODPATH/$rel"
        mkdir -p "$(dirname "$modfile")"
        cp -f "$disrec" "$modfile"
        sed -i \
            -e '/no_display_record/d' \
            -e '/not_support_record/d' \
            -e '/support_record_prompt/d' \
            -e '/disable_ted_function/d' \
            "$modfile"
        mkdir -p "$(dirname "$disrec")"
        mount --bind "$modfile" "$disrec"
    done
done

# Bind app_v2.xml (без проверки наличия, как ты предпочитаешь)
mount -o ro,bind "$MODPATH/app_v2.xml" /my_stock/etc/config/app_v2.xml
mount -o ro,bind "$MODPATH/app_v2.xml" /my_region/etc/config/app_v2.xml

# Apply Play Integrity Fix if enabled
if [ -f "$MODPATH/pif_enabled" ]; then
    resetprop -n ro.boot.verifiedbootstate green
    resetprop -n ro.boot.flash.locked 1
    resetprop -n ro.boot.vbmeta.device_state locked
    resetprop -n ro.build.type user
    resetprop -n ro.build.tags release-keys
    resetprop -n ro.secure 1
    resetprop -n ro.debuggable 0
fi

exit 0