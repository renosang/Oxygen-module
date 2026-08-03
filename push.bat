@echo off
chcp 65001 > nul
echo ====================================================
echo  Day ma nguon len thiet bi Android qua ADB (KernelSU)
echo ====================================================

:: Kiem tra ket noi thiet bi qua ADB
adb devices
if %errorlevel% neq 0 (
    echo [LOI] ADB chua duoc cai dat hoac chua cau hinh bien moi truong PATH.
    pause
    exit /b
)

echo.
echo Chon phuong an day code:
echo [1] Chi cap nhat WebUI (thu muc webroot) - Nhanh, phu hop khi sua giao dien
echo [2] Cap nhat TOAN BO module (webroot, module.prop, cac file sh...)
set opt=1
set /p opt="Lua chon cua ban (1 hoac 2) [Mac dinh: 1]: "

if "%opt%"=="2" (
    echo.
    echo --- Buoc 1: Dang day toan bo cac file module vao thu muc tam thoi ---
    adb shell "mkdir -p /data/local/tmp/addon"
    
    adb push webroot /data/local/tmp/addon/webroot
    adb push system /data/local/tmp/addon/system
    adb push module.prop /data/local/tmp/addon/module.prop
    adb push customize.sh /data/local/tmp/addon/customize.sh
    adb push action.sh /data/local/tmp/addon/action.sh
    adb push post-fs-data.sh /data/local/tmp/addon/post-fs-data.sh
    adb push uninstall.sh /data/local/tmp/addon/uninstall.sh
    
    echo.
    echo --- Buoc 2: Sao chep cac tep tin vao thu muc cai dat [Yeu cau quyen root/su] ---
    adb shell "su -c 'mkdir -p /data/adb/modules/op_android16_app_suite && cp -rf /data/local/tmp/addon/* /data/adb/modules/op_android16_app_suite/ && rm -rf /data/local/tmp/addon'"
    
    echo.
    echo [THANH CONG] Da cap nhat toan bo Module.
) else (
    echo.
    echo --- Buoc 1: Dang day thu muc webroot vao thu muc tam thoi ---
    adb shell "mkdir -p /data/local/tmp/addon/webroot"
    adb push webroot /data/local/tmp/addon/
    
    echo.
    echo --- Buoc 2: Sao chep WebUI vao thu muc cai dat [Yeu cau quyen root/su] ---
    adb shell "su -c 'mkdir -p /data/adb/modules/op_android16_app_suite/webroot && cp -rf /data/local/tmp/addon/webroot/* /data/adb/modules/op_android16_app_suite/webroot/ && rm -rf /data/local/tmp/addon'"
    
    echo.
    echo [THANH CONG] Da cap nhat giao dien WebUI.
)

echo.
echo Luu y: Neu giao dien tren KernelSU Manager chua cap nhat, hay xoa cache cua app Manager hoac khoi dong lai Manager.
pause
