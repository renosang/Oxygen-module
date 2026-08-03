// --- LẤY THÔNG TIN THIẾT BỊ ---
window.fetchDeviceInfo = async function() {
    window.logMsg("Đang đồng bộ dữ liệu hệ thống...");
    const icon = document.getElementById('refresh-icon-info');
    const txt = document.getElementById('refresh-text-info');
    if(icon) icon.classList.add('spin-anim');
    if(txt) txt.innerText = "Đang quét...";
    
    await new Promise(r => setTimeout(r, 50));

    const [brand, model, build, kernel, storage] = await Promise.all([
        window.runShell("getprop ro.product.brand"),
        window.runShell("getprop ro.product.model"),
        window.runShell("getprop ro.build.display.id"),
        window.runShell("uname -r"),
        window.runShell("df -h /data") 
    ]);

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

    const batCmd = `
        l=$(cat /sys/class/power_supply/battery/capacity 2>/dev/null)
        if [ -z "$l" ]; then l=$(dumpsys battery | grep -m 1 'level: ' | cut -d ':' -f2 | tr -d ' '); fi
        ht=$(cat /sys/class/power_supply/battery/health 2>/dev/null)
        echo "B_L:$l|B_H:$ht"
    `;
    const batRes = await window.runShell(batCmd);
    const outBat = String(batRes.stdout);

    let batPercent = "?";
    let batHealthStr = "Chưa rõ";

    const lMatch = outBat.match(/B_L:(\d+)/);
    if (lMatch && lMatch[1]) batPercent = lMatch[1] + "%";

    const htMatch = outBat.match(/B_H:([a-zA-Z]+)/);
    if (htMatch && htMatch[1]) {
        let h = htMatch[1].toLowerCase();
        if (h === "good") batHealthStr = "Tốt";
        else if (h === "cold") batHealthStr = "Lạnh";
        else if (h === "dead") batHealthStr = "Chai / Hỏng";
        else batHealthStr = htMatch[1];
    }

    let storageInfo = "-";
    const dfLines = String(storage.stdout).trim().split('\n');
    if (dfLines.length > 0) {
        const lastLine = dfLines[dfLines.length - 1];
        const parts = lastLine.split(/\s+/);
        if (parts.length >= 4 && parts[1].includes("G")) {
            storageInfo = `<span style="color:var(--green); font-weight:700;">${parts[3]} trống</span>` +
                          `<div style="font-weight:normal; color:var(--text-sub); margin-top:4px;">(Khả dụng: ${parts[1]})</div>`;
        } else {
            storageInfo = lastLine.substring(0,20);
        }
    }

    document.getElementById('info-brand').innerText = String(brand.stdout).trim() || "-";
    document.getElementById('info-model').innerText = String(model.stdout).trim() || "-";
    document.getElementById('info-android').innerText = andVerStr ? `Android ${andVerStr}` : "-";
    document.getElementById('info-build').innerText = String(build.stdout).trim() || "-";
    document.getElementById('info-kernel').innerText = String(kernel.stdout).trim() || "-";
    document.getElementById('info-storage').innerHTML = storageInfo;
    
    document.getElementById('info-battery').innerHTML = 
        `<div style="font-size:12px; line-height:1.7; color:var(--text-sub); font-weight:500; margin-top:2px;">` +
        `Mức pin: <span style="color:var(--cyan); font-weight:700;">${batPercent}</span><br>` +
        `Sức khỏe: <span style="color:var(--green); font-weight:700;">${batHealthStr}</span>` +
        `</div>`;

    if(icon) icon.classList.remove('spin-anim');
    if(txt) txt.innerText = "Cập nhật";
};
