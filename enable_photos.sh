#!/system/bin/sh
MODPATH="$1"
if [ -z "$MODPATH" ]; then 
    echo "Loi: Khong tim thay duong dan module"
    exit 1 
fi

echo "Dang bat tinh nang Zygisk..."
if [ -d "$MODPATH/zygisk.disabled" ]; then
    rm -rf "$MODPATH/zygisk"
    mv "$MODPATH/zygisk.disabled" "$MODPATH/zygisk" 2>/dev/null
fi

echo "Dang loc va tao XML Sysconfig (Dynamic Override)..."
mkdir -p "$MODPATH/system/product/etc/sysconfig"
mkdir -p "$MODPATH/system/etc/sysconfig"

for i in /system/product/etc/sysconfig/*; do
    file=$i
    file=${file/\/system\/product\/etc\/sysconfig\//}
    if [ ! -z "$(grep PIXEL_2020_ $i)" ] || [ ! -z "$(grep PIXEL_2021_ $i)" ] || [ ! -z "$(grep PIXEL_2019_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2018_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2017_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2022_ $i)" ]; then
        [ ! -f "$MODPATH/system/product/etc/sysconfig/$file" ] && cat "/system/product/etc/sysconfig/$file" | grep -v PIXEL_2020_ | grep -v PIXEL_2021_ | grep -v PIXEL_2022_ | grep -v PIXEL_2018_PRELOAD | grep -v PIXEL_2019_PRELOAD >"$MODPATH/system/product/etc/sysconfig/$file"
    fi
done

for i in /system/etc/sysconfig/*; do
    file=$i
    file=${file/\/system\/etc\/sysconfig\//}
    if [ ! -z "$(grep PIXEL_2020_ $i)" ] || [ ! -z "$(grep PIXEL_2021_ $i)" ] || [ ! -z "$(grep PIXEL_2019_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2018_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2017_PRELOAD $i)" ] || [ ! -z "$(grep PIXEL_2022_ $i)" ]; then
        [ ! -f "$MODPATH/system/etc/sysconfig/$file" ] && cat "/system/etc/sysconfig/$file" | grep -v PIXEL_2020_ | grep -v PIXEL_2021_ | grep -v PIXEL_2022_ | grep -v PIXEL_2018_PRELOAD | grep -v PIXEL_2019_PRELOAD | grep -v PIXEL_2017_PRELOAD >"$MODPATH/system/etc/sysconfig/$file"
    fi
done

echo "Dang xoa du lieu Google Photos..."
pm clear com.google.android.apps.photos

echo "DONE"
