#!/system/bin/sh

# Проверка: запускается ли скрипт от root
[ "$(id -u)" != "0" ] && exit 1

MODDIR=${0%/*}
MODPATH="$MODDIR"

# Bind-монтирование содержимого system/
if [ -d "$MODPATH/system" ]; then
    find "$MODPATH/system" -type f | while IFS= read -r file; do
        target_path="/${file#"$MODPATH"}"
        mkdir -p "$(dirname "$target_path")"
        mount --bind "$file" "$target_path"
    done
fi

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

exit 0