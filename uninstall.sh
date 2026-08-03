#!/system/bin/sh

# Очистка dalvik-cache
rm -rf /data/dalvik-cache/arm/*
rm -rf /data/dalvik-cache/arm64/*

# Очистка oat файлов приложений
rm -rf /data/app/*/*/oat/*/*

# Очистка кэша и code_cache приложений
rm -rf /data/data/*/cache/*
rm -rf /data/data/*/code_cache/*
rm -rf /data/user_de/*/*/cache/*
rm -rf /data/user_de/*/*/code_cache/*

# Очистка кэша приложений на SD-карте
rm -rf /sdcard/Android/data/*/cache/*

# Очистка package_cache и shortcut_service для MMS
rm -rf /data/system/package_cache/
rm -rf /data/system_ce/0/shortcut_service/packages/com.android.mms.xml
rm -rf /data/system_ce/0/shortcut_service/packages/com.android.mms.xml.reservecopy
rm -rf /data/system_ce/999/shortcut_service/packages/com.android.mms.xml
rm -rf /data/system_ce/999/shortcut_service/packages/com.android.mms.xml.reservecopy
