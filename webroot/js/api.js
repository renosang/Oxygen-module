// --- 1. LỚP GHI LOG CHI TIẾT ---
window.logMsg = function(msg, type = 'info') {
    const logDiv = document.getElementById('debug-log-content');
    if(logDiv) {
        const time = new Date().toLocaleTimeString('vi-VN');
        let colorClass = '';
        if(type === 'cmd') colorClass = 'log-cmd';
        else if(type === 'success') colorClass = 'log-success';
        else if(type === 'error') colorClass = 'log-err';
        
        logDiv.innerHTML += `<div><span class="log-time">[${time}]</span> <span class="${colorClass}">${msg}</span></div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }
};
window.logMsg("Khởi động Script V7.35...", "success");

// --- 2. LỚP TƯƠNG THÍCH KERNELSU ---
window.KernelAPI = {
    apiName: "Unknown",
    async init() {
        if (window.ksu && typeof window.ksu.exec === 'function') {
            this.apiName = "KernelSU<br>WebUI API";
        } else {
            this.apiName = "Not Detected";
        }
        const el = document.getElementById('info-api');
        if (el) el.innerHTML = this.apiName;
    },
    async exec(cmd) {
        return new Promise(async (resolve) => {
            if (!window.ksu || typeof window.ksu.exec !== 'function') {
                return resolve({ errno: -1, stdout: "", stderr: "Mất kết nối API Manager" });
            }
            try {
                let res = await window.ksu.exec(cmd);
                if (typeof res === 'string') {
                    try { res = JSON.parse(res); } catch (e) { return resolve({ errno: 0, stdout: res, stderr: "" }); }
                }
                resolve({
                    errno: res.errno !== undefined ? Number(res.errno) : 0,
                    stdout: res.stdout || res.out || "", 
                    stderr: res.stderr || res.err || ""
                });
            } catch (error) {
                resolve({ errno: -1, stdout: "", stderr: "Lỗi: " + error.toString() });
            }
        });
    }
};

// --- 3. HÀM RUNSHELL ---
window.runShell = async function(cmd, timeoutMs = 15000) {
    window.logMsg(`> Đang chạy: ${cmd}`, 'cmd');
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout "+timeoutMs+"ms")), timeoutMs));

    try {
        const result = await Promise.race([window.KernelAPI.exec(cmd), timeoutPromise]);
        return result;
    } catch (error) {
        window.logMsg(`  └─ THẤT BẠI: ${error.message}`, 'error');
        return { errno: -1, stdout: "", stderr: error.message };
    }
};

// --- 4. KIỂM TRA QUYỀN ROOT ---
window.checkRoot = async function() {
    await window.KernelAPI.init();
    let testAPI = await window.runShell("getprop ro.product.brand");
    let hasRoot = (window.ksu && typeof window.ksu.exec === 'function' && testAPI.errno === 0 && testAPI.stdout !== "");

    const statusBox = document.getElementById('status-container');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('ksu-status');
    const rootText = document.getElementById('info-root');

    if (hasRoot) {
        statusText.innerText = "KernelSU Active";
        rootText.innerHTML = "Đã cấp quyền<br><span style='font-weight:normal'>(WebUI Root)</span>";
        rootText.className = "info-value accent-green";
        statusBox.style.background = "rgba(0, 230, 118, 0.15)";
        statusBox.style.borderColor = "rgba(0, 230, 118, 0.3)";
        statusBox.style.color = "var(--green)";
        statusDot.style.background = "var(--green)";
        statusDot.style.boxShadow = "0 0 8px var(--green)";
    } else {
        statusText.innerText = "Mất Root / Lỗi API";
        rootText.innerHTML = "Không có<br>quyền Root";
        rootText.className = "info-value accent-red";
        statusBox.style.background = "rgba(255, 82, 82, 0.15)";
        statusBox.style.borderColor = "rgba(255, 82, 82, 0.3)";
        statusBox.style.color = "#ff5252";
        statusDot.style.background = "#ff5252";
        statusDot.style.boxShadow = "0 0 8px #ff5252";
    }
};

// --- 5. HÀM MỞ LINK AN TOÀN QUA INTENT LỆNH SHELL ---
window.openExternalLink = async function(url) {
    window.logMsg(`Đang mở link: ${url}`);
    let res = await window.runShell(`am start -a android.intent.action.VIEW -d "${url}"`);
    if (res.errno !== 0) {
        window.open(url, '_blank');
    }
};
