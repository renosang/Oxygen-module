// State management for apps tab
window.allAppsList = [];
window.currentFilter = 'all';
window.currentSearchQuery = '';

// --- NẠP DANH SÁCH ỨNG DỤNG ---
window.loadAllApps = async function() {
    const box = document.getElementById('freeze-list');
    const icon = document.getElementById('refresh-icon-freeze');
    const txt = document.getElementById('refresh-text-freeze');
    const countTxt = document.getElementById('app-count-text');
    
    if(icon) icon.classList.add('spin-anim');
    if(txt) txt.innerText = "Đang tải...";
    if(countTxt) countTxt.innerText = "Đang quét danh sách gói ứng dụng...";
    
    // Hiển thị Skeleton Loader khi quét danh sách
    if(box) {
        let skeletonHtml = '';
        for (let i = 0; i < 5; i++) {
            skeletonHtml += `
                <div class="skeleton-item">
                    <div class="skeleton-icon"></div>
                    <div class="item-details">
                        <div class="skeleton-text-1"></div>
                        <div class="skeleton-text-2"></div>
                    </div>
                    <div class="skeleton-btn"></div>
                </div>`;
        }
        box.innerHTML = skeletonHtml;
    }
    
    await new Promise(r => setTimeout(r, 100)); // Nhẹ nhàng tạo độ mượt chuyển cảnh
    
    let apps = [];
    let disabledMap = {};

    // Lấy danh sách các app bị đóng băng (disabled)
    const resDis = await window.runShell("pm list packages -d 2>/dev/null || cmd package list packages -d 2>/dev/null");
    if (resDis && resDis.stdout) {
        String(resDis.stdout).split('\n').forEach(line => {
            let pkg = line.replace("package:", "").replace(/\r/g, "").trim();
            if (pkg) disabledMap[pkg] = true;
        });
    }

    // ƯU TIÊN 1: Dùng API Native của KernelSU (Mới, nhanh, chuẩn xác nhất)
    if (window.ksu && typeof window.ksu.listPackages === 'function' && typeof window.ksu.getPackagesInfo === 'function') {
        try {
            window.logMsg("Đang thử dùng API native ksu.listPackages...", "info");
            let pkgsJson = window.ksu.listPackages("all");
            let pkgs = JSON.parse(pkgsJson);
            
            if (pkgs && pkgs.length > 0) {
                let infoJson = window.ksu.getPackagesInfo(JSON.stringify(pkgs));
                let infos = JSON.parse(infoJson);
                
                infos.forEach(info => {
                    apps.push({
                        pkg: info.packageName,
                        path: "",
                        isSystem: info.isSystem,
                        isFrozen: disabledMap[info.packageName] || false,
                        label: info.appLabel
                    });
                });
                window.logMsg(`Đã lấy ${apps.length} ứng dụng qua native API.`, "success");
            }
        } catch (e) {
            window.logMsg("Lỗi khi dùng ksu.listPackages: " + e.message, "error");
        }
    }

    // ƯU TIÊN 2: Dùng lệnh Shell (pm list packages)
    if (apps.length <= 5) {
        window.logMsg("Sử dụng lệnh Shell (pm) để lấy danh sách ứng dụng...", "info");
        const resList = await window.runShell("pm list packages -f -u --user 0 2>/dev/null || cmd package list packages -f -u --user 0 2>/dev/null || pm list packages -f 2>/dev/null");
        if (resList.stdout) {
            apps = []; // Clear incase native API returned partial list
            String(resList.stdout).split('\n').forEach(line => {
                line = line.trim();
                if (!line) return;
                
                let pkgName = "";
                let apkPath = "";
                
                if (line.startsWith("package:")) {
                    line = line.substring(8);
                }
                
                let eqIdx = line.indexOf("=");
                if (eqIdx !== -1) {
                    apkPath = line.substring(0, eqIdx).trim();
                    pkgName = line.substring(eqIdx + 1).trim();
                } else {
                    pkgName = line;
                }
                
                if (pkgName && pkgName.includes(".")) {
                    let isSystem = true;
                    if (apkPath) {
                        if (apkPath.startsWith("/data/")) isSystem = false;
                    } else {
                        const systemPrefixes = ["com.android", "android", "com.google.android", "com.qualcomm", "com.oneplus", "com.oem", "oppo", "coloros", "miui", "com.miui"];
                        isSystem = systemPrefixes.some(prefix => pkgName.startsWith(prefix));
                    }
                    
                    apps.push({
                        pkg: pkgName,
                        path: apkPath,
                        isSystem: isSystem,
                        isFrozen: disabledMap[pkgName] || false
                    });
                }
            });
        }
    }

    // Fallback Cuối Cùng nếu pm list packages chỉ trả về 1 app (do lỗi package visibility restriction)
    if (apps.length <= 5) {
        window.logMsg("Cảnh báo: pm/cmd list packages trả về quá ít ứng dụng, dùng phương án đọc tệp packages.list", "error");
        apps = []; // Xóa kết quả rác
        const resListAlt = await window.runShell("cat /data/system/packages.list 2>/dev/null");
        if (resListAlt.stdout) {
            String(resListAlt.stdout).split('\n').forEach(line => {
                let parts = line.trim().split(/\s+/);
                if (parts.length > 0 && parts[0] && parts[0].includes(".")) {
                    let pkgName = parts[0].trim();
                    let isSystemApp = true;
                    if (parts.length > 3 && parts[3].startsWith("/data/")) {
                        isSystemApp = false;
                    } else {
                        isSystemApp = !pkgName.startsWith("com.zing.zalo") && !pkgName.startsWith("com.mservice") && !pkgName.startsWith("com.shopee") && !pkgName.startsWith("com.grab") && !pkgName.startsWith("com.facebook");
                    }
                    
                    apps.push({
                        pkg: pkgName,
                        path: parts.length > 3 ? parts[3] : "",
                        isSystem: isSystemApp,
                        isFrozen: disabledMap[pkgName] || false
                    });
                }
            });
        }
    }

    // Lọc trùng lặp nếu có
    const uniqueAppsMap = {};
    apps.forEach(app => {
        uniqueAppsMap[app.pkg] = app;
    });
    const finalApps = Object.values(uniqueAppsMap);

    // Lưu trữ và render
    window.allAppsList = finalApps.sort((a, b) => a.pkg.localeCompare(b.pkg));
    window.renderAppsList();
    
    if(icon) icon.classList.remove('spin-anim');
    if(txt) txt.innerText = "Tải lại";
};

// --- HIỂN THỊ DANH SÁCH RA UI ---
window.renderAppsList = function() {
    const box = document.getElementById('freeze-list');
    if (!box) return;

    if (window.allAppsList.length === 0) {
        box.innerHTML = '<div class="loading-text" style="color:var(--red)">Không thể quét danh sách ứng dụng. Hãy mở Console Logs để kiểm tra quyền root.</div>';
        return;
    }

    // Lọc theo bộ lọc và từ khóa tìm kiếm
    let filtered = window.allAppsList.filter(app => {
        // Lọc theo tab
        if (window.currentFilter === 'user' && app.isSystem) return false;
        if (window.currentFilter === 'system' && !app.isSystem) return false;
        if (window.currentFilter === 'frozen' && !app.isFrozen) return false;
        
        // Lọc theo thanh tìm kiếm
        if (window.currentSearchQuery) {
            return app.pkg.toLowerCase().includes(window.currentSearchQuery);
        }
        return true;
    });

    let html = "";
    if (filtered.length === 0) {
        html = '<div class="loading-text">Không tìm thấy ứng dụng nào phù hợp.</div>';
    } else {
        filtered.forEach(app => {
            const btnClass = app.isFrozen ? "btn-freeze-action is-frozen" : "btn-freeze-action is-active";
            const subText = app.isFrozen ? "<span style='color:var(--cyan)'>Trạng thái: Bị Đóng Băng</span>" : "<span style='color:var(--text-sub)'>Trạng thái: Đang hoạt động</span>";
            
            const badgeClass = app.isSystem ? "badge badge-system" : "badge badge-user";
            const badgeText = app.isSystem ? "Hệ thống" : "Cá nhân";
            
            const safeId = app.pkg.replace(/\./g, '_');
            const iconUrl = "ksu://icon/" + app.pkg;
            
            const displayLabel = app.label || app.pkg;
            
            // Risk heuristics
            const isHighRisk = app.isSystem && !app.pkg.startsWith('com.oplus') && !app.pkg.startsWith('com.oneplus');
            const svgHigh = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; margin-top:-1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            const svgSafe = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; margin-top:-1px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`;
            
            const riskBadgeHtml = isHighRisk 
                ? `<span class="risk-badge risk-high">${svgHigh} Rủi Ro Cao</span>` 
                : `<span class="risk-badge risk-safe">${svgSafe} An Toàn</span>`;

            const svgLock = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>`;
            const svgUnlock = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            
            const btnIcon = app.isFrozen ? svgUnlock : svgLock;
            const btnTitle = app.isFrozen ? "Mở Băng" : "Đóng Băng";

            html += `
                <div class="list-item app-row" data-pkg="${app.pkg}" style="align-items: center;">
                    <img class="app-icon" src="${iconUrl}" style="align-self: flex-start; margin-top: 4px;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 width=%2224%22 height=%2224%22 fill=%22%23888888%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z%22/></svg>'\">
                    <div class="item-details" style="display:flex; flex-direction:column; gap:4px; padding-right:8px; overflow:hidden;">
                        <div class="item-name" title="${displayLabel}" style="display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:15px; font-weight:700;">
                            ${displayLabel}
                        </div>
                        <div style="display:flex; gap:6px; align-items:center; margin-top:2px;">
                            <span class="${badgeClass}">${badgeText}</span>
                            ${riskBadgeHtml}
                        </div>
                        <div class="item-sub" style="font-size:11px; opacity:0.8; margin-top:2px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${app.pkg}">${app.pkg}</div>
                    </div>
                    <div style="flex-shrink:0;">
                        <button id="btn-${safeId}" class="btn ${btnClass}" onclick="window.toggleFreeze('${app.pkg}', ${app.isFrozen}, ${app.isSystem})" style="width:42px; height:42px; padding:0; border-radius:12px; display:flex; align-items:center; justify-content:center;" title="${btnTitle}">
                            ${btnIcon}
                        </button>
                    </div>
                </div>`;
        });
    }

    box.innerHTML = html;
    window.updateAppCountText();
};

// --- THAY ĐỔI BỘ LỌC TABS ---
window.changeFreezeFilter = function(filterName) {
    window.currentFilter = filterName;
    
    // Cập nhật class active trên UI
    const filters = ['all', 'user', 'system', 'frozen'];
    filters.forEach(f => {
        const btn = document.getElementById(`filter-btn-${f}`);
        if (btn) {
            if (f === filterName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    window.renderAppsList();
};

// --- TÌM KIẾM ỨNG DỤNG ---
window.filterApps = function(query) {
    window.currentSearchQuery = query.toLowerCase().trim();
    window.renderAppsList();
};

// --- CẬP NHẬT CÁC CON SỐ SỐ LIỆU ---
window.updateAppCountText = function() {
    const totalCount = window.allAppsList.length;
    const userCount = window.allAppsList.filter(a => !a.isSystem).length;
    const systemCount = window.allAppsList.filter(a => a.isSystem).length;
    const frozenCount = window.allAppsList.filter(a => a.isFrozen).length;
    
    // Cập nhật số liệu trên nhãn bộ lọc
    const btnAll = document.getElementById('filter-btn-all');
    const btnUser = document.getElementById('filter-btn-user');
    const btnSystem = document.getElementById('filter-btn-system');
    const btnFrozen = document.getElementById('filter-btn-frozen');
    
    if (btnAll) btnAll.innerText = `Tất cả (${totalCount})`;
    if (btnUser) btnUser.innerText = `Cá nhân (${userCount})`;
    if (btnSystem) btnSystem.innerText = `Hệ thống (${systemCount})`;
    if (btnFrozen) btnFrozen.innerText = `Đóng băng (${frozenCount})`;
    
    // Cập nhật mô tả số lượng chính
    const countTxt = document.getElementById('app-count-text');
    if(countTxt) {
        if (window.currentSearchQuery) {
            let filteredCount = window.allAppsList.filter(app => {
                if (window.currentFilter === 'user' && app.isSystem) return false;
                if (window.currentFilter === 'system' && !app.isSystem) return false;
                if (window.currentFilter === 'frozen' && !app.isFrozen) return false;
                return app.pkg.toLowerCase().includes(window.currentSearchQuery);
            }).length;
            countTxt.innerHTML = `<span style="color:var(--yellow); font-size:12px;">🔍 Tìm thấy ${filteredCount} ứng dụng</span>`;
        } else {
            countTxt.innerHTML = `
                <div style="display:flex; gap:12px; align-items:center; background:rgba(0,0,0,0.2); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-bottom:4px; font-size:12px;">
                    <span style="color:var(--text); font-weight:700;">${totalCount} Apps</span>
                    <span style="color:var(--green); display:flex; align-items:center; gap:4px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);"></span>${userCount}</span>
                    <span style="color:var(--red); display:flex; align-items:center; gap:4px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--red);"></span>${systemCount}</span>
                    <span style="color:var(--cyan); display:flex; align-items:center; gap:4px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--cyan);"></span>${frozenCount} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="12" y1="2" x2="15" y2="5"></line><line x1="12" y1="2" x2="9" y2="5"></line><line x1="12" y1="22" x2="15" y2="19"></line><line x1="12" y1="22" x2="9" y2="19"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="12" x2="5" y2="9"></line><line x1="2" y1="12" x2="5" y2="15"></line><line x1="22" y1="12" x2="19" y2="9"></line><line x1="22" y1="12" x2="19" y2="15"></line></svg></span>
                </div>
            `;
        }
    }
};

// --- ĐÓNG BĂNG / MỞ BĂNG ---
window.toggleFreeze = async function(pkg, currentlyFrozen, isSystem) {
    const isHighRisk = isSystem && !pkg.startsWith('com.oplus') && !pkg.startsWith('com.oneplus');
    
    if (isHighRisk && !currentlyFrozen) {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm-modal');
            const cancelBtn = document.getElementById('custom-confirm-cancel');
            const okBtn = document.getElementById('custom-confirm-ok');
            const desc = document.getElementById('custom-confirm-text');
            
            if (!modal) return window.executeFreeze(pkg, currentlyFrozen, isSystem);
            
            desc.innerHTML = `Bạn chuẩn bị đóng băng ứng dụng hệ thống nguy cơ cao:<br><b style="color:var(--cyan);">${pkg}</b><br><br>Đóng băng có thể gây lỗi hệ điều hành, đứng máy hoặc tự khởi động lại. Bạn có chắc chắn không?`;
            
            modal.style.display = 'flex';
            
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
            okBtn.onclick = async () => {
                modal.style.display = 'none';
                await window.executeFreeze(pkg, currentlyFrozen, isSystem);
                resolve(true);
            };
        });
    } else {
        await window.executeFreeze(pkg, currentlyFrozen, isSystem);
    }
};

window.executeFreeze = async function(pkg, currentlyFrozen, isSystem) {

    const safeId = pkg.replace(/\./g, '_');
    const btn = document.getElementById('btn-' + safeId);
    const sub = document.getElementById('sub-' + safeId);
    
    if(btn) { 
        btn.innerHTML = "<span class='spin-anim refresh-icon'>↻</span>"; 
        btn.disabled = true; 
    }
    
    let res;
    if (currentlyFrozen) {
        window.logMsg(`Đang MỞ băng: ${pkg}...`);
        res = await window.runShell(`cmd package enable --user 0 ${pkg}`);
        if (res.errno !== 0) res = await window.runShell(`pm enable ${pkg}`);
    } else {
        window.logMsg(`Đang ĐÓNG băng: ${pkg}...`);
        res = await window.runShell(`cmd package disable-user --user 0 ${pkg}`);
        if (res.errno !== 0) res = await window.runShell(`pm disable ${pkg}`);
    }

    if (res.errno === 0) {
        // Cập nhật state cục bộ
        const app = window.allAppsList.find(a => a.pkg === pkg);
        if (app) {
            app.isFrozen = !currentlyFrozen;
        }
        
        // Thay thế UI nhanh không cần reload toàn bộ
        if(btn) {
            btn.disabled = false;
            
            const svgLock = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>`;
            const svgUnlock = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
            
            if(currentlyFrozen) {
                btn.innerHTML = svgLock;
                btn.title = "Đóng Băng";
                btn.className = "btn btn-freeze-action is-active"; 
                btn.onclick = () => window.toggleFreeze(pkg, false, isSystem);
                window.logMsg(`Mở băng THÀNH CÔNG: ${pkg}`, 'success');
            } else {
                btn.innerHTML = svgUnlock;
                btn.title = "Mở Băng";
                btn.className = "btn btn-freeze-action is-frozen"; 
                btn.onclick = () => window.toggleFreeze(pkg, true, isSystem);
                window.logMsg(`Đóng băng THÀNH CÔNG: ${pkg}`, 'success');
            }
        }
        
        window.updateAppCountText();
    } else {
        alert("Lỗi lệnh. Hãy mở Log xem chi tiết.");
        if (btn) { 
            btn.innerHTML = currentlyFrozen ? "Mở Băng" : "Đóng Băng"; 
            btn.disabled = false; 
        }
        window.logMsg(`Lỗi khi Đóng/Mở băng ${pkg}: ${res.stderr}`, 'error');
    }
};
