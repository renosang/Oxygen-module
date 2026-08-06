#!/bin/bash

echo "===================================================="
echo " Đẩy mã nguồn lên thiết bị Android qua ADB (KernelSU)"
echo "===================================================="

# Kiểm tra kết nối thiết bị qua ADB
adb devices
if [ $? -ne 0 ]; then
    echo "[LỖI] ADB chưa được cài đặt hoặc chưa cấu hình biến môi trường PATH."
    read -p "Nhấn Enter để thoát..."
    exit 1
fi

echo ""
echo "Chọn phương án đẩy code:"
echo "[1] Chỉ cập nhật WebUI (thư mục webroot) - Nhanh, phù hợp khi sửa giao diện"
echo "[2] Cập nhật TOÀN BỘ module (webroot, module.prop, các file sh...)"
read -p "Lựa chọn của bạn (1 hoặc 2) [Mặc định: 1]: " opt

if [ "$opt" = "2" ]; then
    echo ""
    echo "--- Bước 1: Đang đẩy toàn bộ các file module vào thư mục tạm thời ---"
    adb shell "mkdir -p /data/local/tmp/addon"
    
    adb push webroot /data/local/tmp/addon/webroot
    adb push system /data/local/tmp/addon/system
    adb push zygisk /data/local/tmp/addon/zygisk
    adb push module.prop /data/local/tmp/addon/module.prop
    adb push customize.sh /data/local/tmp/addon/customize.sh
    adb push action.sh /data/local/tmp/addon/action.sh
    adb push post-fs-data.sh /data/local/tmp/addon/post-fs-data.sh
    adb push uninstall.sh /data/local/tmp/addon/uninstall.sh
    
    echo ""
    echo "--- Bước 2: Sao chép các tệp tin vào thư mục cài đặt (Yêu cầu quyền root/su) ---"
    adb shell "su -c 'mkdir -p /data/adb/modules/op_android16_app_suite && cp -rf /data/local/tmp/addon/* /data/adb/modules/op_android16_app_suite/ && rm -rf /data/local/tmp/addon'"
    
    echo ""
    echo "[THÀNH CÔNG] Đã cập nhật toàn bộ Module."
else
    echo ""
    echo "--- Bước 1: Đang đẩy thư mục webroot vào thư mục tạm thời ---"
    adb shell "mkdir -p /data/local/tmp/addon/webroot"
    adb push webroot /data/local/tmp/addon/
    
    echo ""
    echo "--- Bước 2: Sao chép WebUI vào thư mục cài đặt (Yêu cầu quyền root/su) ---"
    adb shell "su -c 'mkdir -p /data/adb/modules/op_android16_app_suite/webroot && cp -rf /data/local/tmp/addon/webroot/* /data/adb/modules/op_android16_app_suite/webroot/ && rm -rf /data/local/tmp/addon'"
    
    echo ""
    echo "[THÀNH CÔNG] Đã cập nhật giao diện WebUI."
fi

echo ""
echo "Lưu ý: Nếu giao diện trên KernelSU Manager chưa cập nhật, hãy xóa cache của app Manager hoặc khởi động lại Manager."
read -p "Nhấn Enter để tiếp tục..."
