hbh#!/system/bin/sh
# Action script for opening Telegram channel

TG_LINK="tg://resolve?domain=OnePlusMod"
WEB_LINK="https://t.me/OnePlusMod"

ui_print "- Opening Telegram channel..."
ui_print "  $WEB_LINK"

# Сначала пробуем открыть напрямую в Telegram
su -c "am start -a android.intent.action.VIEW -d '$TG_LINK'" >/dev/null 2>&1

# Если не удалось (нет Telegram), открываем через браузер
if [ $? -ne 0 ]; then
  su -c "am start -a android.intent.action.VIEW -d '$WEB_LINK'" >/dev/null 2>&1
fi