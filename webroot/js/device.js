// --- LẤY THÔNG TIN THIẾT BỊ ---
window.fetchDeviceInfo = async function() {
    if (!window._firstDeviceInfoFetch) {
        window.logMsg("Đang đồng bộ dữ liệu hệ thống...");
        window._firstDeviceInfoFetch = true;
    }
    
    if (window.deviceInfoTimer) {
        clearTimeout(window.deviceInfoTimer);
        window.deviceInfoTimer = null;
    }

    // Cache static data globally so we don't fetch it repeatedly.
    // Executed sequentially to prevent KernelSU JS bridge concurrency bugs.
    if (!window.deviceStaticInfo) {
        const brand = await window.runShell("getprop ro.product.brand");
        const model = await window.runShell("getprop ro.product.model");
        const build = await window.runShell("getprop ro.build.display.id");
        const kernel = await window.runShell("uname -r");
        
        let andVerStr = "";
        const propsToTry = ["ro.system.build.version.release", "ro.build.version.release_or_codename"];
        for (let prop of propsToTry) {
            let res = await window.runShell(`getprop ${prop}`);
            if (res.stdout && String(res.stdout).trim() !== "") { andVerStr = String(res.stdout).trim(); break; }
        }
        if (!andVerStr) {
            let fileRes = await window.runShell("cat /system/build.prop | grep 'ro.system.build.version.release='");
            let match = String(fileRes.stdout).match(/release=(.+)/);
            if (match && match[1]) andVerStr = match[1].trim();
        }

        window.deviceStaticInfo = {
            brand: String(brand.stdout).trim() || "-",
            model: String(model.stdout).trim() || "-",
            build: String(build.stdout).trim() || "-",
            kernel: String(kernel.stdout).trim() || "-",
            android: andVerStr ? `Android ${andVerStr}` : "-"
        };
        
        // Update Static UI
        document.getElementById('info-brand').innerText = window.deviceStaticInfo.brand;
        document.getElementById('info-model').innerText = window.deviceStaticInfo.model;
        document.getElementById('info-android').innerText = window.deviceStaticInfo.android;
        document.getElementById('info-build').innerText = window.deviceStaticInfo.build;
        document.getElementById('info-kernel').innerText = window.deviceStaticInfo.kernel;
    }

    // Dynamic Data (RAM, Storage, Battery)
    // Fetch concurrently using Promise.all to bypass any command string parsing bugs in KSU, while maintaining extreme speed
    const batCmd = `
        l=$(cat /sys/class/power_supply/battery/capacity 2>/dev/null)
        if [ -z "$l" ]; then l=$(dumpsys battery 2>/dev/null | grep -m 1 'level: ' | cut -d ':' -f2 | tr -d ' '); fi
        ht=$(cat /sys/class/power_supply/battery/health 2>/dev/null)
        st=$(cat /sys/class/power_supply/battery/status 2>/dev/null)
        echo "$l|$ht|$st"
    `;
    
    const ramCmd = `
        t=$(cat /proc/meminfo 2>/dev/null | grep -i '^MemTotal' | grep -o '[0-9]*' | head -n 1)
        a=$(cat /proc/meminfo 2>/dev/null | grep -i '^MemAvailable' | grep -o '[0-9]*' | head -n 1)
        f=$(cat /proc/meminfo 2>/dev/null | grep -i '^MemFree' | grep -o '[0-9]*' | head -n 1)
        c=$(cat /proc/meminfo 2>/dev/null | grep -i '^Cached' | grep -o '[0-9]*' | head -n 1)
        b=$(cat /proc/meminfo 2>/dev/null | grep -i '^Buffers' | grep -o '[0-9]*' | head -n 1)
        if [ -z "$t" ]; then
            m=$(free -k 2>/dev/null | grep -i 'Mem:')
            t=$(echo "$m" | tr -s ' ' | cut -d ' ' -f2)
            f=$(echo "$m" | tr -s ' ' | cut -d ' ' -f4)
            b=$(echo "$m" | tr -s ' ' | cut -d ' ' -f6)
            c=$(echo "$m" | tr -s ' ' | cut -d ' ' -f7)
        fi
        echo "$t|$a|$f|$c|$b"
    `;

    // Execute sequentially because KernelSU WebUI (window.ksu.exec) JS bridge may NOT support parallel concurrent calls (Promise.all)
    // AND it has a bug where it ONLY returns the LAST line of stdout. We MUST output exactly 1 line for everything!
    const storage = await window.runShell("df -h /data 2>/dev/null | tail -n 1");
    const ramInfo = await window.runShell(ramCmd);
    const batRes = await window.runShell(batCmd);

    // BẬT DEBUG LOG ĐỂ XEM KẾT QUẢ RAW TỪ KSU TRẢ VỀ
    // window.logMsg("RAW RAM: " + String(ramInfo.stdout).substring(0, 150), "debug");
    // window.logMsg("RAW PIN: " + String(batRes.stdout), "debug");

    const rParts = String(ramInfo.stdout).trim().split('|');
    ramTotal = parseInt(rParts[0], 10) || 0;
    let rAvail = parseInt(rParts[1], 10) || 0;
    mFree = parseInt(rParts[2], 10) || 0;
    mCached = parseInt(rParts[3], 10) || 0;
    mBuffers = parseInt(rParts[4], 10) || 0;
    
    if (rAvail > 0) {
        ramFree = rAvail;
        hasAvailable = true;
    }
    


    if (!hasAvailable && ramTotal > 0) ramFree = mFree + mCached + mBuffers;
    if (ramTotal < 0) ramTotal = 0;
    if (ramFree < 0) ramFree = 0;
    if (ramFree > ramTotal) ramFree = ramTotal;

    let ramTotalGb = (ramTotal / 1024 / 1024).toFixed(1);
    let ramFreeGb = (ramFree / 1024 / 1024).toFixed(1);
    if (ramTotal > 0) ramPercent = Math.round(((ramTotal - ramFree) / ramTotal) * 100);

    // --- Parse Storage ---
    let storageTotal = "-", storageFree = "-", storagePercent = 0;
    const dfLine = String(storage.stdout).trim();
    if (dfLine) {
        const sParts = dfLine.split(/\s+/);
        if (sParts.length >= 5 && sParts[1].includes("G")) {
            storageTotal = sParts[1]; // Size
            storageFree = sParts[3]; // Avail
            storagePercent = parseInt(sParts[4].replace('%', ''), 10) || 0;
        } else if (sParts.length >= 5 && sParts[0].includes("G")) {
            storageTotal = sParts[0];
            storageFree = sParts[2];
            storagePercent = parseInt(sParts[3].replace('%', ''), 10) || 0;
        }
    }

    // --- Parse Battery ---
    let batPercentNum = 0;
    let batHealthStr = "Chưa rõ";
    let isCharging = false;
    
    const outBat = String(batRes.stdout || "").trim();
    if (outBat) {
        const bParts = outBat.split('|');
        batPercentNum = parseInt(bParts[0], 10) || 0;
        
        if (bParts.length >= 2) {
            let h = bParts[1].toLowerCase();
            if (h === "good") batHealthStr = "Tốt";
            else if (h === "cold") batHealthStr = "Lạnh";
            else if (h === "dead") batHealthStr = "Chai / Hỏng";
            else batHealthStr = bParts[1];
        }
        
        if (bParts.length >= 3) {
            let s = bParts[2].toLowerCase();
            if (s.includes("charging") && !s.includes("discharging")) isCharging = true;
        }
    }

    // --- Update Dynamic UI ---
    const ramDonut = document.getElementById('widget-ram-donut');
    if (ramDonut) {
        ramDonut.style.setProperty('--percent', `${ramPercent}%`);
        ramDonut.style.setProperty('--chart-color', 'var(--cyan)');
        document.getElementById('widget-ram-free').innerText = `${ramFreeGb}G`;
        
        let elUsed = document.getElementById('widget-ram-used');
        let elTotal = document.getElementById('widget-ram-total');
        if (elUsed) elUsed.innerText = `${ramPercent}%`;
        if (elTotal) elTotal.innerText = `${ramTotalGb}GB`;
    }

    const storageDonut = document.getElementById('widget-storage-donut');
    if (storageDonut) {
        storageDonut.style.setProperty('--percent', `${storagePercent}%`);
        let sColor = 'var(--green)';
        if (storagePercent > 70) sColor = 'var(--yellow)';
        if (storagePercent > 90) sColor = 'var(--red)';
        storageDonut.style.setProperty('--chart-color', sColor);
        document.getElementById('widget-storage-free').innerText = storageFree;
        
        let elSUsed = document.getElementById('widget-storage-used');
        let elSTotal = document.getElementById('widget-storage-total');
        if (elSUsed) elSUsed.innerText = `${storagePercent}%`;
        if (elSTotal) elSTotal.innerText = storageTotal;
    }
    
    const batFill = document.getElementById('widget-battery-fill');
    if (batFill) {
        batFill.style.setProperty('--percent', `${batPercentNum}%`);
        let bColor = 'var(--green)';
        if (batPercentNum <= 20) bColor = 'var(--red)';
        else if (batPercentNum <= 50) bColor = 'var(--yellow)';
        batFill.style.setProperty('--chart-color', bColor);

        if (isCharging) {
            batFill.classList.add('charging-anim');
            document.getElementById('widget-battery-percent').innerText = `⚡ ${batPercentNum}%`;
        } else {
            batFill.classList.remove('charging-anim');
            document.getElementById('widget-battery-percent').innerText = `${batPercentNum}%`;
        }
        document.getElementById('widget-battery-health').innerText = `Sức khỏe: ${batHealthStr}`;
    }

    // Schedule next update in 3 seconds if the tab is active
    window.deviceInfoTimer = setTimeout(() => {
        window.deviceInfoTimer = null;
        const tabInfo = document.getElementById('tab-info');
        if (tabInfo && tabInfo.classList.contains('active')) {
            window.fetchDeviceInfo();
        }
    }, 3000);
};
