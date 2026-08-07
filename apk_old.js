// --- KHO ỨNG DỤNG ĐỀ XUẤT (PLAY STORE) ---
window.loadVnEssentialApps = async function() {
    const box = document.getElementById('apk-list');
    const icon = document.getElementById('refresh-icon-apk');
    const txt = document.getElementById('refresh-text-apk');
    
    if(icon) icon.classList.add('spin-anim');
    if(txt) txt.innerText = "Đang tải...";
    if(box) box.innerHTML = '<div class="loading-text">Đang tải danh sách app...</div>';
    
    await new Promise(r => setTimeout(r, 100));

    // Bộ sưu tập SVG siêu nhỏ gọn cho từng danh mục
    const svgSocial = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    const svgMusic = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
    const svgTool = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    const svgVideo = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
    const svgFolder = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    const svgShop = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

    const appsList = [
        // Các app theo yêu cầu của User
        { name: "VNeID", pkg: "com.vnid", iconUrl: "https://play-lh.googleusercontent.com/Utqq3TNQjcmk0vSU20EnnkvswdUkehddvz-p99fciGgpuP8ccXnkBS3tadvLh0Yq3szz9kB8i5EtOwOBNkYcMw", icon: svgTool, desc: "Ứng dụng định danh điện tử", url: "https://play.google.com/store/apps/details?id=com.vnid" },
        { name: "TikTok", pkg: "com.ss.android.ugc.trill", iconUrl: "https://play-lh.googleusercontent.com/U07AzIaLq2iMqMCMtnM5iiSrzy7__SmOkD5qeH1vWy745-0rCv6LbSRuyjlDN-4s8EDW1UkHJPrrpd5jYNNkgA", icon: svgVideo, desc: "Mạng xã hội video ngắn", url: "https://play.google.com/store/apps/details?id=com.ss.android.ugc.trill" },
        { name: "Facebook", pkg: "com.facebook.katana", iconUrl: "https://play-lh.googleusercontent.com/12KEJDhgk6oyE1VgmfCuFzFrQripZ_endElbvEhU1rZawQgV3RI-v3II8fDslI1sdC_WKBkmtxS3jxuIihk33Q", icon: svgSocial, desc: "Mạng xã hội lớn nhất", url: "https://play.google.com/store/apps/details?id=com.facebook.katana" },
        { name: "Messenger", pkg: "com.facebook.orca", iconUrl: "https://play-lh.googleusercontent.com/cuRpiGqvAMkcbAOibD-AKCBagAunUkspQUWC_jVZF2Hob_ODdmkefnZeqkofW1idFQHhgZgnLIjsqT-2v7JKBw", icon: svgSocial, desc: "Ứng dụng nhắn tin của Facebook", url: "https://play.google.com/store/apps/details?id=com.facebook.orca" },
        { name: "USB Audio Player PRO", pkg: "com.extreamsd.usbaudioplayerpro", iconUrl: "https://play-lh.googleusercontent.com/XodUS5S6Dg7i5-PL7t17KpaHVNoRVZlALLkV81IoHgZIqJzswDnBGTpb5Oe10EG6BHYkxGagdl2uUJ0XXEvLBA", icon: svgMusic, desc: "Trình phát nhạc chất lượng cao (Hi-Res)", url: "https://play.google.com/store/apps/details?id=com.extreamsd.usbaudioplayerpro" },
        { name: "Poweramp", pkg: "com.maxmpz.audioplayer", iconUrl: "https://play-lh.googleusercontent.com/-21ASw97RWIu-CnDVbEEtTrfVIDqpfhY4eofgk5aT98q4E8jnrMVxNqI0J7JYgRTkHjoOoWM58ScUzu30cxevQ", icon: svgMusic, desc: "Trình phát nhạc mạnh mẽ", url: "https://play.google.com/store/apps/details?id=com.maxmpz.audioplayer" },
        { name: "Poweramp Equalizer", pkg: "com.maxmpz.equalizer", iconUrl: "https://play-lh.googleusercontent.com/lmS_FxLOnq0oHKHZjJLCMH6znc6QSurMgi6ynN4aPWs1LCqftsafOKlG7BOxuZVud5XwXjAbogSgDmGn8KfY", icon: svgTool, desc: "Bộ cân bằng âm thanh nâng cao", url: "https://play.google.com/store/apps/details?id=com.maxmpz.equalizer" },
        { name: "Poweramp v3 skin", pkg: "com.poweramp.v3.proxima", iconUrl: "https://play-lh.googleusercontent.com/Hud8ODFM4q0VJkcAR-XSkZ6e9DxKejkA-w7JXgNyv__N77XL847IArW27P5Ftj5K24HgKC9OHys6YK37ID9g_A", icon: svgTool, desc: "Giao diện (Skin) cho Poweramp", url: "https://play.google.com/store/apps/details?id=com.poweramp.v3.proxima" },
        { name: "Zalo", pkg: "com.zing.zalo", iconUrl: "https://play-lh.googleusercontent.com/D3QF_jSgL9vmGcZ4GwaaqoyIRi-KqXh10aeHkMNZyNO4PT2MoGqmfsW63u-4CLCNQ-BdCPbKofBg8V7Rh8wgWQ", icon: svgSocial, desc: "Ứng dụng nhắn tin phổ biến tại VN", url: "https://play.google.com/store/apps/details?id=com.zing.zalo" },
        { name: "Telegram", pkg: "org.telegram.messenger", iconUrl: "https://play-lh.googleusercontent.com/PyZ3akMGXPV0tKKirKNwfO--PSQW3FHR6rD_H9mAaukZ8LiHyYFuBLeU8UZ2ok6r5SP79-3prkfybWKh98AZAD0", icon: svgSocial, desc: "Nhắn tin bảo mật tốc độ cao", url: "https://play.google.com/store/apps/details?id=org.telegram.messenger" },
        { name: "Canva", pkg: "com.canva.editor", iconUrl: "https://play-lh.googleusercontent.com/52fzAlhKzDyZV8ttyQ_DHB-jOeLZAZEdKlgXnWL__YNMZuvsoRCshJX5mr_ArFZjK7rte4hqEJ4ucjtuKJK5", icon: svgTool, desc: "Thiết kế đồ họa và chỉnh sửa ảnh/video", url: "https://play.google.com/store/apps/details?id=com.canva.editor" },
        { name: "Solid Explorer", pkg: "pl.solidexplorer2", iconUrl: "https://play-lh.googleusercontent.com/8TYqGVCV5BgN623s6nBzxatxLlmRotCINOvZHr4BrVvvdIV9RGWR97tAtwdpDtdm9d7hWgLh1d0A0PbqfLwLEkc", icon: svgFolder, desc: "Trình quản lý file chuyên nghiệp", url: "https://play.google.com/store/apps/details?id=pl.solidexplorer2" },
        
        // Gợi ý thêm từ hệ thống (Bổ sung đa dạng)
        { name: "YouTube", pkg: "com.google.android.youtube", iconUrl: "https://play-lh.googleusercontent.com/QNmuZQc9I6Zbe3mWnSr0hycnENqGFCI5p3yE29Hkxtf22T0IWS6zTrpxULLyyjWpB7ONAXDsDQXnXcVWokl3eg", icon: svgVideo, desc: "Nền tảng chia sẻ video lớn nhất", url: "https://play.google.com/store/apps/details?id=com.google.android.youtube" },
        { name: "CapCut", pkg: "com.lemon.lvoverseas", iconUrl: "https://play-lh.googleusercontent.com/M78HyakHaxKrjoeqYx41E9DXfVYYtx67nvc7Ks4G4zFQeaAJdGCi8gzzGSrHIwlrmnJS6zD9S4fAXqdEwfuHQAQ", icon: svgVideo, desc: "Chỉnh sửa video chuyên nghiệp", url: "https://play.google.com/store/apps/details?id=com.lemon.lvoverseas" },
        { name: "Spotify", pkg: "com.spotify.music", iconUrl: "https://play-lh.googleusercontent.com/IzQgYCcnCFCD08GR-3bdtcT8xzOvrNkC84avGT5CwTX2VIqmTmKKJcP_Cd4JoBOdmCMlTndlOzV6hrthg2fOWA", icon: svgMusic, desc: "Nghe nhạc trực tuyến", url: "https://play.google.com/store/apps/details?id=com.spotify.music" },
        { name: "Shopee", pkg: "com.shopee.vn", iconUrl: "https://play-lh.googleusercontent.com/mlS7AEDM9Ef-bEd_kc25xhtmJQN6hgpEEd3BQm20kIWMJNKWYfO93tuNJBT9WVcs8oZ9tpHdAPbEXI6FSsyw", icon: svgShop, desc: "Mua sắm trực tuyến", url: "https://play.google.com/store/apps/details?id=com.shopee.vn" }
    ];

    let html = "";
    appsList.forEach(app => {
        // Chuyển URL thành dạng market:// để ép mở bằng CH Play app (Native)
        let intentUrl = app.url;
        if (app.pkg) {
            intentUrl = "market://details?id=" + app.pkg;
        }

        const safeUrl = intentUrl.replace(/'/g, "\\'");
        
        let iconHtml = "";
        if (app.iconUrl) {
            iconHtml = `<div style="position:relative; width:100%; height:100%;">
                            <img src="${app.iconUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center;">${app.icon}</div>
                        </div>`;
        } else {
            iconHtml = `<div style="position:relative; width:100%; height:100%;">
                            <img src="ksu://icon/${app.pkg}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center;">${app.icon}</div>
                        </div>`;
        }

        // Thiết kế Premium cho hàng hiển thị
        html += `<div class="list-item vn-app-row" style="align-items:center; padding:12px;">
                    <div class="item-icon" style="background:rgba(255,255,255,0.05); width:44px; height:44px; padding:${app.iconUrl ? '2px' : '10px'}; border-radius:12px; margin-right:12px; display:flex; align-items:center; justify-content:center; color:var(--cyan); flex-shrink:0;">
                        ${iconHtml}
                    </div>
                    <div class="item-details" style="flex:1; overflow:hidden;">
                        <div class="item-name" style="font-size:15px; font-weight:700; color:var(--text); line-height:1.2;">${app.name}</div>
                        <div class="item-sub" style="font-size:12px; color:var(--text-sub); margin-top:4px; line-height:1.3; white-space:normal;">${app.desc}</div>
                        <div class="item-sub" style="font-size:10px; color:var(--cyan); margin-top:6px; opacity:0.8;">${app.pkg}</div>
                    </div>
                    <div style="flex-shrink:0;">
                        <button class="btn btn-primary" style="border-radius:12px; padding:8px 16px; font-size:12px; font-weight:700;" onclick="window.openExternalLink('${safeUrl}')">
                            <span style="display:flex; align-items:center; gap:4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Cài Đặt
                            </span>
                        </button>
                    </div>
                </div>`;
    });

    if(box) box.innerHTML = html;
    if(icon) icon.classList.remove('spin-anim');
    if(txt) txt.innerText = "Làm mới";
};
