import { DownloadCloud, CheckCircle, Download } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useKsu } from '../hooks/useKsu';

export default function ApkTab() {
  const { hasRoot, runShell } = useKsu();
  const [search, setSearch] = useState('');
  const [installedPkgs, setInstalledPkgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInstalled = async () => {
      const ksu = (window as any).ksu;
      if (ksu && typeof ksu.listPackages === 'function') {
        try {
          const pkgs = JSON.parse(ksu.listPackages("all"));
          setInstalledPkgs(new Set(pkgs));
        } catch(e) {}
      } else if (hasRoot) {
        const res = await runShell("pm list packages");
        if (res.stdout) {
           const pkgs = res.stdout.split('\n').map(l => l.replace('package:', '').trim()).filter(Boolean);
           setInstalledPkgs(new Set(pkgs));
        }
      }
    };
    fetchInstalled();
  }, [hasRoot, runShell]);

  const appsList = [
    { name: "VNeID", pkg: "com.vnid", iconUrl: "https://play-lh.googleusercontent.com/Utqq3TNQjcmk0vSU20EnnkvswdUkehddvz-p99fciGgpuP8ccXnkBS3tadvLh0Yq3szz9kB8i5EtOwOBNkYcMw", desc: "Ứng dụng định danh điện tử" },
    { name: "TikTok", pkg: "com.ss.android.ugc.trill", iconUrl: "https://play-lh.googleusercontent.com/U07AzIaLq2iMqMCMtnM5iiSrzy7__SmOkD5qeH1vWy745-0rCv6LbSRuyjlDN-4s8EDW1UkHJPrrpd5jYNNkgA", desc: "Mạng xã hội video ngắn" },
    { name: "Facebook", pkg: "com.facebook.katana", iconUrl: "https://play-lh.googleusercontent.com/12KEJDhgk6oyE1VgmfCuFzFrQripZ_endElbvEhU1rZawQgV3RI-v3II8fDslI1sdC_WKBkmtxS3jxuIihk33Q", desc: "Mạng xã hội lớn nhất" },
    { name: "Messenger", pkg: "com.facebook.orca", iconUrl: "https://play-lh.googleusercontent.com/cuRpiGqvAMkcbAOibD-AKCBagAunUkspQUWC_jVZF2Hob_ODdmkefnZeqkofW1idFQHhgZgnLIjsqT-2v7JKBw", desc: "Ứng dụng nhắn tin của Facebook" },
    { name: "USB Audio Player PRO", pkg: "com.extreamsd.usbaudioplayerpro", iconUrl: "https://play-lh.googleusercontent.com/XodUS5S6Dg7i5-PL7t17KpaHVNoRVZlALLkV81IoHgZIqJzswDnBGTpb5Oe10EG6BHYkxGagdl2uUJ0XXEvLBA", desc: "Trình phát nhạc chất lượng cao" },
    { name: "Poweramp", pkg: "com.maxmpz.audioplayer", iconUrl: "https://play-lh.googleusercontent.com/-21ASw97RWIu-CnDVbEEtTrfVIDqpfhY4eofgk5aT98q4E8jnrMVxNqI0J7JYgRTkHjoOoWM58ScUzu30cxevQ", desc: "Trình phát nhạc mạnh mẽ" },
    { name: "Poweramp Equalizer", pkg: "com.maxmpz.equalizer", iconUrl: "https://play-lh.googleusercontent.com/lmS_FxLOnq0oHKHZjJLCMH6znc6QSurMgi6ynN4aPWs1LCqftsafOKlG7BOxuZVud5XwXjAbogSgDmGn8KfY", desc: "Bộ cân bằng âm thanh" },
    { name: "Poweramp v3 skin", pkg: "com.poweramp.v3.proxima", iconUrl: "https://play-lh.googleusercontent.com/Hud8ODFM4q0VJkcAR-XSkZ6e9DxKejkA-w7JXgNyv__N77XL847IArW27P5Ftj5K24HgKC9OHys6YK37ID9g_A", desc: "Giao diện cho Poweramp" },
    { name: "Zalo", pkg: "com.zing.zalo", iconUrl: "https://play-lh.googleusercontent.com/D3QF_jSgL9vmGcZ4GwaaqoyIRi-KqXh10aeHkMNZyNO4PT2MoGqmfsW63u-4CLCNQ-BdCPbKofBg8V7Rh8wgWQ", desc: "Ứng dụng nhắn tin VN" },
    { name: "Telegram", pkg: "org.telegram.messenger", iconUrl: "https://play-lh.googleusercontent.com/PyZ3akMGXPV0tKKirKNwfO--PSQW3FHR6rD_H9mAaukZ8LiHyYFuBLeU8UZ2ok6r5SP79-3prkfybWKh98AZAD0", desc: "Nhắn tin bảo mật cao" },
    { name: "Canva", pkg: "com.canva.editor", iconUrl: "https://play-lh.googleusercontent.com/52fzAlhKzDyZV8ttyQ_DHB-jOeLZAZEdKlgXnWL__YNMZuvsoRCshJX5mr_ArFZjK7rte4hqEJ4ucjtuKJK5", desc: "Thiết kế đồ họa và chỉnh sửa" },
    { name: "Solid Explorer", pkg: "pl.solidexplorer2", iconUrl: "https://play-lh.googleusercontent.com/8TYqGVCV5BgN623s6nBzxatxLlmRotCINOvZHr4BrVvvdIV9RGWR97tAtwdpDtdm9d7hWgLh1d0A0PbqfLwLEkc", desc: "Trình quản lý file chuyên nghiệp" },
    { name: "YouTube", pkg: "com.google.android.youtube", iconUrl: "https://play-lh.googleusercontent.com/QNmuZQc9I6Zbe3mWnSr0hycnENqGFCI5p3yE29Hkxtf22T0IWS6zTrpxULLyyjWpB7ONAXDsDQXnXcVWokl3eg", desc: "Nền tảng chia sẻ video" },
    { name: "CapCut", pkg: "com.lemon.lvoverseas", iconUrl: "https://play-lh.googleusercontent.com/M78HyakHaxKrjoeqYx41E9DXfVYYtx67nvc7Ks4G4zFQeaAJdGCi8gzzGSrHIwlrmnJS6zD9S4fAXqdEwfuHQAQ", desc: "Chỉnh sửa video chuyên nghiệp" },
    { name: "Spotify", pkg: "com.spotify.music", iconUrl: "https://play-lh.googleusercontent.com/IzQgYCcnCFCD08GR-3bdtcT8xzOvrNkC84avGT5CwTX2VIqmTmKKJcP_Cd4JoBOdmCMlTndlOzV6hrthg2fOWA", desc: "Nghe nhạc trực tuyến" },
    { name: "Shopee", pkg: "com.shopee.vn", iconUrl: "https://play-lh.googleusercontent.com/mlS7AEDM9Ef-bEd_kc25xhtmJQN6hgpEEd3BQm20kIWMJNKWYfO93tuNJBT9WVcs8oZ9tpHdAPbEXI6FSsyw", desc: "Mua sắm trực tuyến" },
    { name: "Vietcombank", pkg: "com.VCB", iconUrl: "ksu://icon/com.VCB", desc: "Ngân hàng Vietcombank" },
    { name: "MyVIB", pkg: "com.vib.myvib", searchQ: "VIB", iconUrl: "ksu://icon/com.vib.myvib", desc: "Ngân hàng số VIB" },
    { name: "MB Bank", pkg: "com.mbmobile", iconUrl: "ksu://icon/com.mbmobile", desc: "Ngân hàng Quân Đội MBBank" },
    { name: "Sacombank Pay", pkg: "com.sacombank.ewallet", iconUrl: "ksu://icon/com.sacombank.ewallet", desc: "Ví điện tử Sacombank Pay" },
    { name: "Cake by VPBank", pkg: "xyz.be.cake", iconUrl: "ksu://icon/xyz.be.cake", desc: "Ngân hàng số Cake" },
    { name: "ACB ONE", pkg: "mobile.acb.com.vn", iconUrl: "ksu://icon/mobile.acb.com.vn", desc: "Ngân hàng Á Châu ACB" },
    { name: "OCB OMNI", pkg: "vn.com.ocb.awe", iconUrl: "ksu://icon/vn.com.ocb.awe", desc: "Ngân hàng Phương Đông OCB" },
    { name: "Techcombank", pkg: "vn.com.techcombank.bb.app", iconUrl: "ksu://icon/vn.com.techcombank.bb.app", desc: "Ngân hàng Techcombank" },
    { name: "VPBank NEO", pkg: "com.vnpay.vpbankonline", iconUrl: "ksu://icon/com.vnpay.vpbankonline", desc: "Ngân hàng số VPBank NEO" },
    { name: "BIDV SmartBanking", pkg: "com.vnpay.bidv", iconUrl: "ksu://icon/com.vnpay.bidv", desc: "Ngân hàng BIDV" },
    { name: "VietinBank iPay", pkg: "com.vietinbank.ipay", iconUrl: "ksu://icon/com.vietinbank.ipay", desc: "Ngân hàng VietinBank" }
  ];

  const filteredApps = useMemo(() => {
    return appsList.filter(app => 
      app.name.toLowerCase().includes(search.toLowerCase()) || 
      app.desc.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openApp = async (app: any) => {
    // Luôn ưu tiên dùng KSU shell để mở trực tiếp App CH Play (Native)
    if (hasRoot) {
      if (app.searchQ) {
         await runShell(`am start -a android.intent.action.VIEW -d "market://search?q=${app.searchQ}&c=apps"`);
      } else {
         await runShell(`am start -a android.intent.action.VIEW -d "market://details?id=${app.pkg}"`);
      }
    } else {
      if (app.searchQ) {
         window.location.href = `intent://play.google.com/store/search?q=${app.searchQ}&c=apps#Intent;scheme=https;package=com.android.vending;end`;
      } else {
         window.location.href = `intent://details?id=${app.pkg}#Intent;scheme=market;package=com.android.vending;end`;
      }
    }
  };

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  return (
    <div className="glass-card" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-title" style={{ marginBottom: '8px' }}>
        <DownloadCloud className="text-cyan" size={20} />
        <span>Kho Ứng Dụng Đề Xuất</span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '16px', lineHeight: 1.5 }}>
        Cài đặt nhanh các ứng dụng thiết yếu và ngân hàng tại Việt Nam trực tiếp qua CH Play.
      </div>

      <input 
        type="text" 
        className="search-input" 
        placeholder="Tìm kiếm ứng dụng..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="list-container" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {filteredApps.map((app, i) => {
          const isInstalled = installedPkgs.has(app.pkg);
          return (
            <div className="list-item" key={i}>
              <div className="item-icon" style={{ background: 'transparent', padding: 0, overflow: 'hidden', position: 'relative' }}>
                <img 
                   src={app.iconUrl} 
                   alt={app.name} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                     const parent = (e.target as HTMLImageElement).parentElement;
                     if (parent) {
                        parent.style.background = stringToColor(app.name);
                        parent.innerHTML = `<span style="color:white;font-weight:bold;font-size:18px">${app.name.charAt(0).toUpperCase()}</span>`;
                     }
                   }}
                />
              </div>
              <div className="item-info">
                <span className="item-title">{app.name}</span>
                <span className="item-desc">{app.desc}</span>
              </div>
              {isInstalled ? (
                <button className="btn" style={{ padding: '6px 12px', fontSize: '11px', minWidth: '70px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', border: '1px solid rgba(16, 185, 129, 0.3)', pointerEvents: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Đã cài
                  </span>
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => openApp(app)} style={{ padding: '6px 12px', fontSize: '11px', minWidth: '70px', background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} /> Cài đặt
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
