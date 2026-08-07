#!/system/bin/sh
# Action script for opening Telegram channel

TG_LINK="tg://resolve?domain=BeeGadget"
WEB_LINK="https://t.me/beegadget"

ui_print "- Opening Telegram channel..."
ui_print "  $WEB_LINK"

# Trước tiên, hãy thử mở trực tiếp trong Telegram.
su -c "am start -a android.intent.action.VIEW -d '$TG_LINK'" >/dev/null 2>&1

# Nếu không thành công (không có Telegram), hãy mở qua trình duyệt.
if [ $? -ne 0 ]; then
  su -c "am start -a android.intent.action.VIEW -d '$WEB_LINK'" >/dev/null 2>&1
fi