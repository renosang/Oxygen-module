// Quản lý tính năng Google Photos không giới hạn
window.checkPhotosStatus = async function() {
    const statusVal = document.getElementById('info-photos-status');
    const btn = document.getElementById('btn-toggle-photos');
    const photosVerEl = document.getElementById('info-photos-ver');
    const badgePhotos = document.getElementById('badge-photos');
    const gmsVerEl = document.getElementById('info-gms-ver');
    const badgeGms = document.getElementById('badge-gms');
    const metaNameEl = document.getElementById('info-meta-name');
    const badgeMeta = document.getElementById('badge-meta');
    
    if (!statusVal || !btn) return;

    const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    const crossIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

    // Kiểm tra version của Google Photos
    let photosVerRes = await window.runShell("dumpsys package com.google.android.apps.photos | grep versionName | head -n 1 | sed 's/.*versionName=//'");
    let pVer = photosVerRes.stdout.trim();
    if (photosVerEl) photosVerEl.innerText = pVer ? "Version " + pVer : "Not Found";
    if (badgePhotos) {
        if (pVer) {
            badgePhotos.innerHTML = checkIcon + " INSTALLED";
            badgePhotos.className = "badge badge-user";
        } else {
            badgePhotos.innerHTML = crossIcon + " MISSING";
            badgePhotos.className = "badge badge-system";
        }
    }

    // Kiểm tra version của GMS
    let gmsVerRes = await window.runShell("dumpsys package com.google.android.gms | grep versionName | head -n 1 | sed 's/.*versionName=//'");
    let gVer = gmsVerRes.stdout.trim();
    if (gmsVerEl) gmsVerEl.innerText = gVer ? "Version " + gVer : "Not Found";
    if (badgeGms) {
        if (gVer) {
            badgeGms.innerHTML = checkIcon + " INSTALLED";
            badgeGms.className = "badge badge-user";
        } else {
            badgeGms.innerHTML = crossIcon + " MISSING";
            badgeGms.className = "badge badge-system";
        }
    }

    // Kiểm tra Meta-module (ZygiskNext, Shamiko, TrickyStore, OverlayS, v.v)
    let metaRes = await window.runShell("ls -d /data/adb/modules/* | grep -E -i 'zygisk_next|shamiko|trickystore|meta|mountify|overlays'");
    let metaLines = metaRes.stdout.trim().split('\n').filter(l => l.trim() !== "");
    let hasMeta = metaLines.length > 0;
    if (metaNameEl) {
        if (hasMeta) {
            let lastName = metaLines[metaLines.length - 1].split('/').pop();
            metaNameEl.innerText = "Module: " + lastName;
        } else {
            metaNameEl.innerText = "No meta module found";
        }
    }
    if (badgeMeta) {
        if (hasMeta) {
            badgeMeta.innerHTML = checkIcon + " INSTALLED";
            badgeMeta.className = "badge badge-user";
        } else {
            badgeMeta.innerHTML = crossIcon + " MISSING";
            badgeMeta.className = "badge badge-system";
        }
    }

    // Tìm đường dẫn thực tế của module bằng lệnh shell
    let pathRes = await window.runShell("pwd");
    let modPath = pathRes.stdout.trim().replace("/webroot", "");
    if (!modPath.includes("modules")) {
        modPath = "/data/adb/modules/op_android16_app_suite";
    }

    // Kiểm tra trạng thái On/Off của tính năng
    let checkRes = await window.runShell(`[ -d "${modPath}/zygisk" ] && echo "ON" || echo "OFF"`);
    let isOn = checkRes.stdout.trim() === "ON";

    if (isOn) {
        statusVal.innerHTML = "Đang Bật <span style='font-weight:normal; font-size:12px;'>(Zygisk hoạt động)</span>";
        statusVal.className = "info-value accent-green";
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg> Tắt Tính Năng (Yêu cầu Reboot)`;
        btn.className = "btn btn-primary";
    } else {
        statusVal.innerHTML = "Đang Tắt <span style='font-weight:normal; font-size:12px;'>(Chưa kích hoạt)</span>";
        statusVal.className = "info-value accent-red";
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Bật Tính Năng (Yêu cầu Reboot)`;
        btn.className = "btn btn-primary";
        btn.style.background = "linear-gradient(135deg, var(--green), #00b359)";
        btn.style.boxShadow = "0 4px 15px rgba(0, 230, 118, 0.3)";
    }

    window.photosIsOn = isOn;
    window.photosModPath = modPath;
};

window.togglePhotosFeature = async function() {
    if (window.photosModPath === undefined) return;
    const btn = document.getElementById('btn-toggle-photos');
    btn.innerHTML = `<span class="refresh-icon spin-anim">↻</span> Đang xử lý...`;
    btn.disabled = true;

    let res;
    if (window.photosIsOn) {
        // Tắt tính năng
        res = await window.runShell(`rm -rf "${window.photosModPath}/zygisk.disabled" && mv "${window.photosModPath}/zygisk" "${window.photosModPath}/zygisk.disabled"`);
        if (res.errno !== 0) {
            window.logMsg("Lỗi khi tắt tính năng Photos: " + res.stderr, "error");
        } else {
            window.logMsg("Đã TẮT tính năng Google Photos.", "success");
            window.showModal("Đã Tắt tính năng. Bạn có muốn khởi động lại thiết bị ngay bây giờ để áp dụng?", () => {
                window.runShell("reboot");
            });
        }
    } else {
        // Bật tính năng
        res = await window.runShell(`sh "${window.photosModPath}/webroot/enable_photos.sh" "${window.photosModPath}"`);
        if (res.errno !== 0) {
            window.logMsg("Lỗi khi bật tính năng Photos: " + res.stderr, "error");
        } else {
            window.logMsg("Đã BẬT Google Photos Unlimited, tạo file cấu hình và xóa dữ liệu app thành công!", "success");
            window.showModal("Đã kích hoạt xong (đã xóa data app). Bạn CẦN KHỞI ĐỘNG LẠI thiết bị để Zygisk nhận diện. Khởi động lại ngay?", () => {
                window.runShell("reboot");
            });
        }
    }
    
    btn.disabled = false;
    await window.checkPhotosStatus();
};
