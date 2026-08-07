// Logic for Advanced Tweaks (Adblock, Debloat, Performance)

// --- 1. Systemless Ad-Blocker ---
window.checkAdblockStatus = async function() {
    const statusEl = document.getElementById('adblock-status');
    const btnEl = document.getElementById('btn-toggle-adblock');
    
    statusEl.innerText = "Đang tải trạng thái...";
    
    // Check if systemless hosts is enabled or custom hosts exists
    // Typical magisk hosts file is at /data/adb/modules/hosts/system/etc/hosts
    // We will just check if our module has a hosts file mounted, or we can use our own module path:
    // /data/adb/modules/op_android16_app_suite/system/etc/hosts
    const checkCmd = `[ -f "/data/adb/modules/op_android16_app_suite/system/etc/hosts" ] && echo "ON" || echo "OFF"`;
    
    try {
        const res = await window.runShell(checkCmd);
        if (res.stdout.trim() === "ON") {
            statusEl.innerText = "Đang Bật (Hoạt động)";
            statusEl.style.color = "var(--green)";
            btnEl.innerText = "Tắt";
            btnEl.className = "btn btn-cancel";
        } else {
            statusEl.innerText = "Đang Tắt";
            statusEl.style.color = "var(--text-sub)";
            btnEl.innerText = "Bật";
            btnEl.className = "btn btn-primary";
        }
    } catch (e) {
        statusEl.innerText = "Không thể kiểm tra";
    }
};

window.toggleAdblock = async function() {
    const statusEl = document.getElementById('adblock-status');
    if (statusEl.innerText.includes("Bật")) {
        // Tắt adblock bằng cách xóa file hosts trong module
        window.logMsg("Đang tắt Ad-Blocker...");
        const cmd = `rm -f /data/adb/modules/op_android16_app_suite/system/etc/hosts`;
        await window.runShell(cmd);
        window.logMsg("Đã tắt Ad-Blocker. Vui lòng khởi động lại thiết bị.", "success");
        window.checkAdblockStatus();
        window.showModal("Bạn cần khởi động lại thiết bị để thay đổi có hiệu lực.");
    } else {
        // Bật adblock, nếu chưa có file thì tải
        window.updateAdblock();
    }
};

window.updateAdblock = async function() {
    window.logMsg("Bắt đầu tải dữ liệu Ad-Blocker từ StevenBlack/hosts...");
    const cmd = `
        mkdir -p /data/adb/modules/op_android16_app_suite/system/etc
        curl -s -o /data/adb/modules/op_android16_app_suite/system/etc/hosts "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
        if [ -f "/data/adb/modules/op_android16_app_suite/system/etc/hosts" ]; then
            chmod 644 /data/adb/modules/op_android16_app_suite/system/etc/hosts
            echo "SUCCESS"
        else
            echo "FAILED"
        fi
    `;
    
    try {
        const res = await window.runShell(cmd);
        if (res.stdout.includes("SUCCESS")) {
            window.logMsg("Đã cập nhật dữ liệu Ad-Blocker thành công.", "success");
            window.checkAdblockStatus();
            window.showModal("Tải file hosts thành công! Vui lòng khởi động lại máy để áp dụng.");
        } else {
            window.logMsg("Lỗi: Không thể tải dữ liệu Ad-Blocker. Kiểm tra kết nối mạng.", "error");
        }
    } catch (e) {
        window.logMsg("Lỗi ngoại lệ khi cập nhật Ad-Blocker: " + e, "error");
    }
};


// --- 2. 1-Click Debloat ---
const bloatwareList = [
    // --- OPPO / HeyTap (Thị trường nội địa & Quốc tế) ---
    "com.heytap.market",
    "com.heytap.themestore",
    "com.heytap.browser",
    "com.heytap.habit.analysis",
    "com.heytap.cloud",
    "com.heytap.usercenter",
    "com.heytap.smarthome",
    "com.heytap.yoli",
    "com.heytap.music",
    "com.heytap.video",
    "com.heytap.reader",
    "com.heytap.vip",
    "com.heytap.pictorial",
    "com.heytap.health",
    "com.heytap.accessory",
    // --- ColorOS ---
    "com.coloros.gamespace",
    "com.coloros.childrenspace",
    "com.coloros.focusmode",
    "com.coloros.wallet",
    "com.coloros.video",
    "com.coloros.weather.service",
    "com.coloros.healthcheck",
    "com.coloros.backuprestore",
    "com.coloros.phonemanager",
    "com.coloros.securepay",
    // --- Oplus ---
    "com.oplus.appmarket",
    "com.oplus.theme",
    "com.oplus.pay",
    "com.oplus.community",
    "com.oplus.vui",
    "com.oplus.games",
    "com.oplus.safecenter",
    "com.oplus.logkit",
    "com.oplus.ota",
    "com.oplus.crashbox",
    "com.oplus.breeno",
    "com.oplus.sos",
    "com.oplus.carlink",
    // --- OnePlus ---
    "com.oneplus.mall",
    "com.oneplus.account",
    "com.oneplus.tv",
    "com.oneplus.membership"
];

window.runDebloat = async function() {
    window.logMsg("Bắt đầu dọn dẹp (Debloat) OxygenOS/ColorOS...");
    
    const progressContainer = document.getElementById('debloat-progress-container');
    const progressBar = document.getElementById('debloat-progress-bar');
    const statusText = document.getElementById('debloat-status-text');
    const appsList = document.getElementById('debloat-apps-list');
    
    progressContainer.style.display = 'block';
    statusText.style.display = 'block';
    appsList.style.display = 'block';
    appsList.innerHTML = '';
    
    let count = 0;
    const total = bloatwareList.length;
    
    for (let i = 0; i < total; i++) {
        const pkg = bloatwareList[i];
        statusText.innerText = `Đang xử lý: ${pkg} (${i + 1}/${total})`;
        progressBar.style.width = `${((i + 1) / total) * 100}%`;
        
        window.logMsg(`Đang vô hiệu hóa: ${pkg}`);
        const res = await window.runShell(`pm disable-user --user 0 ${pkg}`);
        
        if (res.stdout.includes("new state")) {
            count++;
            appsList.innerHTML += `<div style="color:var(--green)">✓ Đã vô hiệu hóa: ${pkg}</div>`;
        } else {
            appsList.innerHTML += `<div style="color:var(--text-sub)">- Không tìm thấy hoặc thất bại: ${pkg}</div>`;
        }
    }
    
    statusText.innerText = `Hoàn tất! Đã dọn dẹp ${count}/${total} ứng dụng.`;
    statusText.style.color = "var(--green)";
    window.logMsg(`Hoàn thành. Đã xử lý vô hiệu hóa ${total} gói (${count} thành công).`, "success");
};

window.restoreDebloat = async function() {
    window.logMsg("Đang khôi phục các ứng dụng đã dọn dẹp...");
    
    const progressContainer = document.getElementById('debloat-progress-container');
    const progressBar = document.getElementById('debloat-progress-bar');
    const statusText = document.getElementById('debloat-status-text');
    const appsList = document.getElementById('debloat-apps-list');
    
    progressContainer.style.display = 'block';
    statusText.style.display = 'block';
    appsList.style.display = 'block';
    appsList.innerHTML = '';
    statusText.style.color = "var(--cyan)";
    
    let count = 0;
    const total = bloatwareList.length;
    
    for (let i = 0; i < total; i++) {
        const pkg = bloatwareList[i];
        statusText.innerText = `Đang khôi phục: ${pkg} (${i + 1}/${total})`;
        progressBar.style.width = `${((i + 1) / total) * 100}%`;
        
        window.logMsg(`Đang khôi phục: ${pkg}`);
        const res = await window.runShell(`pm enable ${pkg}`);
        
        if (res.stdout.includes("new state")) {
            count++;
            appsList.innerHTML += `<div style="color:var(--yellow)">✓ Đã khôi phục: ${pkg}</div>`;
        } else {
            appsList.innerHTML += `<div style="color:var(--text-sub)">- Không tìm thấy hoặc thất bại: ${pkg}</div>`;
        }
    }
    
    statusText.innerText = `Hoàn tất! Đã khôi phục ${count}/${total} ứng dụng.`;
    statusText.style.color = "var(--green)";
    window.logMsg("Hoàn thành quá trình khôi phục.", "success");
};


// --- 3. Performance Profiles ---
window.applyProfile = async function(profile) {
    // UI update
    ['battery', 'balanced', 'performance'].forEach(p => {
        const btn = document.getElementById('profile-btn-' + p);
        if (btn) {
            if (p === profile) {
                btn.classList.add('profile-active');
            } else {
                btn.classList.remove('profile-active');
            }
        }
    });
    
    window.logMsg(`Đang áp dụng cấu hình: ${profile.toUpperCase()}...`);
    
    let cmd = "";
    if (profile === 'battery') {
        cmd = `
            # Battery Saver Profile
            settings put global low_power 1
            for gov in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
                echo "powersave" > $gov 2>/dev/null || echo "schedutil" > $gov 2>/dev/null
            done
            echo "Cấu hình PIN đã được kích hoạt."
        `;
    } else if (profile === 'balanced') {
        cmd = `
            # Balanced Profile
            settings put global low_power 0
            for gov in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
                echo "schedutil" > $gov 2>/dev/null
            done
            echo "Cấu hình CÂN BẰNG đã được kích hoạt."
        `;
    } else if (profile === 'performance') {
        cmd = `
            # Performance Profile
            settings put global low_power 0
            for gov in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
                echo "performance" > $gov 2>/dev/null
            done
            echo "Cấu hình HIỆU NĂNG CAO đã được kích hoạt."
        `;
    }
    
    try {
        const res = await window.runShell(cmd);
        window.logMsg(res.stdout || res.stderr, "success");
    } catch (e) {
        window.logMsg("Có lỗi khi áp dụng cấu hình: " + e, "error");
    }
};

// --- 4. GMS Doze & Battery Optimization ---
window.toggleGmsDoze = async function() {
    window.logMsg("Đang tối ưu hóa GMS để tiết kiệm pin...");
    const cmd = `
        dumpsys deviceidle whitelist -com.google.android.gms
        pm disable-user --user 0 com.google.android.gms/com.google.android.gms.chimera.GmsIntentOperationService
        pm disable-user --user 0 com.google.android.gms/com.google.android.gms.auth.api.signin.RevocationBoundService
        echo "SUCCESS"
    `;
    try {
        const res = await window.runShell(cmd);
        if (res.stdout.includes("SUCCESS")) {
            document.getElementById('gms-doze-status').innerText = "Đã kích hoạt (GMS Doze On)";
            document.getElementById('gms-doze-status').style.color = "var(--green)";
            window.logMsg("Tối ưu GMS thành công!", "success");
        }
    } catch (e) {
        window.logMsg("Lỗi khi tối ưu GMS: " + e, "error");
    }
};

window.restoreGms = async function() {
    window.logMsg("Đang khôi phục cài đặt mặc định cho GMS...");
    const cmd = `
        dumpsys deviceidle whitelist +com.google.android.gms
        pm enable com.google.android.gms/com.google.android.gms.chimera.GmsIntentOperationService
        pm enable com.google.android.gms/com.google.android.gms.auth.api.signin.RevocationBoundService
        echo "SUCCESS"
    `;
    try {
        const res = await window.runShell(cmd);
        if (res.stdout.includes("SUCCESS")) {
            document.getElementById('gms-doze-status').innerText = "Chưa kích hoạt";
            document.getElementById('gms-doze-status').style.color = "var(--text-sub)";
            window.logMsg("Đã khôi phục GMS thành công.", "success");
        }
    } catch (e) {
        window.logMsg("Lỗi khi khôi phục GMS: " + e, "error");
    }
};

// --- 5. DNS Manager ---
window.applyDNS = async function(server) {
    // UI update
    ['cloudflare', 'google', 'adguard', 'default'].forEach(s => {
        const btn = document.getElementById('dns-btn-' + s);
        if (btn) {
            if (s === server) btn.classList.add('profile-active');
            else btn.classList.remove('profile-active');
        }
    });

    window.logMsg(`Đang thiết lập DNS: ${server.toUpperCase()}...`);
    let cmd = "";
    if (server === 'cloudflare') {
        cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier 1dot1dot1dot1.cloudflare-dns.com`;
    } else if (server === 'google') {
        cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.google`;
    } else if (server === 'adguard') {
        cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.adguard.com`;
    } else {
        cmd = `settings put global private_dns_mode opportunistic`;
    }
    
    try {
        await window.runShell(cmd);
        window.logMsg(`Đã chuyển đổi DNS sang ${server.toUpperCase()} thành công.`, "success");
    } catch (e) {
        window.logMsg("Lỗi khi đổi DNS: " + e, "error");
    }
};

// --- 6. Force Refresh Rate ---
window.applyRefreshRate = async function(rate) {
    // UI update
    [60, 90, 120].forEach(r => {
        const btn = document.getElementById('hz-btn-' + r);
        if (btn) {
            if (r === rate) btn.classList.add('profile-active');
            else btn.classList.remove('profile-active');
        }
    });

    window.logMsg(`Đang ép xung tần số quét màn hình lên ${rate}Hz...`);
    const cmd = `
        settings put system peak_refresh_rate ${rate}.0
        settings put system min_refresh_rate ${rate}.0
        settings put secure min_refresh_rate ${rate}.0
        settings put secure peak_refresh_rate ${rate}.0
        settings put secure refresh_rate_mode 2
        settings put global oneplus_screen_refresh_rate 2
        settings put global oppo_screen_refresh_rate 2
        settings put secure user_refresh_rate ${rate}
    `;
    try {
        await window.runShell(cmd);
        window.logMsg(`Ép xung màn hình ${rate}Hz thành công! (Lưu ý: Bạn có thể cần khởi động lại một số app để có hiệu lực)`, "success");
    } catch (e) {
        window.logMsg("Lỗi khi ép xung tần số quét: " + e, "error");
    }
};

// --- 7. Anti-App Kill (RAM & Multitasking) ---
window.toggleAntiAppKill = async function() {
    window.logMsg("Đang thiết lập lại thông số RAM & Đa nhiệm...");
    const cmd = `
        device_config put activity_manager max_phantom_processes 8192
        settings put global settings_enable_monitor_phantom_procs false
        settings put global activity_manager_constants max_cached_processes=128
        echo "SUCCESS"
    `;
    try {
        const res = await window.runShell(cmd);
        if (res.stdout.includes("SUCCESS")) {
            document.getElementById('anti-kill-status').innerText = "Đã tối ưu đa nhiệm";
            document.getElementById('anti-kill-status').style.color = "var(--green)";
            window.logMsg("Đã tắt Phantom Process Killer và nới lỏng RAM thành công!", "success");
        }
    } catch (e) {
        window.logMsg("Lỗi khi tối ưu đa nhiệm: " + e, "error");
    }
};

// --- 8. Deep Cache Cleaner ---
window.runDeepClean = async function() {
    window.logMsg("Bắt đầu quét và dọn rác hệ thống chuyên sâu...");
    const cmd = `
        rm -rf /data/log/*
        rm -rf /data/tombstones/*
        rm -rf /data/anr/*
        rm -rf /data/local/tmp/*
        pm trim-caches 9999999999999
        echo "SUCCESS"
    `;
    try {
        const res = await window.runShell(cmd);
        if (res.stdout.includes("SUCCESS")) {
            window.logMsg("Dọn dẹp thành công! Đã giải phóng toàn bộ log, file báo lỗi và cache thừa.", "success");
            alert("Đã dọn dẹp hệ thống thành công!");
        }
    } catch (e) {
        window.logMsg("Lỗi trong quá trình dọn dẹp: " + e, "error");
    }
};

// --- 9. Display & Animation Tweaker ---
window.applyAnimation = async function(scale) {
    // UI update
    ['1', '05', '0'].forEach(s => {
        const btn = document.getElementById('anim-btn-' + s);
        if (btn) {
            let val = (s === '1') ? 1 : (s === '05' ? 0.5 : 0);
            if (val === scale) btn.classList.add('profile-active');
            else btn.classList.remove('profile-active');
        }
    });

    window.logMsg(`Đang thay đổi tốc độ hiệu ứng về mức ${scale}x...`);
    const cmd = `
        settings put global window_animation_scale ${scale}
        settings put global transition_animation_scale ${scale}
        settings put global animator_duration_scale ${scale}
    `;
    try {
        await window.runShell(cmd);
        window.logMsg(`Thay đổi tốc độ hiệu ứng thành công!`, "success");
    } catch (e) {
        window.logMsg("Lỗi khi đổi tốc độ hiệu ứng: " + e, "error");
    }
};

window.applyDPI = async function(value) {
    window.logMsg(`Đang cấu hình DPI màn hình thành: ${value}...`);
    let cmd = "";
    if (value === 'reset') {
        cmd = `wm density reset`;
    } else {
        cmd = `wm density ${value}`;
    }
    try {
        await window.runShell(cmd);
        window.logMsg(`Đã áp dụng độ phân giải hiển thị mới!`, "success");
    } catch (e) {
        window.logMsg("Lỗi khi thay đổi DPI: " + e, "error");
    }
};
