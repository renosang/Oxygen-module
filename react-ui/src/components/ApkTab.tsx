import { DownloadCloud, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ApkTab() {
  const [search, setSearch] = useState('');

  const appsList = [
    { name: "VNeID", pkg: "com.vnid", iconUrl: "https://play-lh.googleusercontent.com/Utqq3TNQjcmk0vSU20EnnkvswdUkehddvz-p99fciGgpuP8ccXnkBS3tadvLh0Yq3szz9kB8i5EtOwOBNkYcMw", desc: "Ứng dụng định danh điện tử", url: "market://details?id=com.vnid" },
    { name: "TikTok", pkg: "com.ss.android.ugc.trill", iconUrl: "https://play-lh.googleusercontent.com/U07AzIaLq2iMqMCMtnM5iiSrzy7__SmOkD5qeH1vWy745-0rCv6LbSRuyjlDN-4s8EDW1UkHJPrrpd5jYNNkgA", desc: "Mạng xã hội video ngắn", url: "market://details?id=com.ss.android.ugc.trill" },
    { name: "Facebook", pkg: "com.facebook.katana", iconUrl: "https://play-lh.googleusercontent.com/12KEJDhgk6oyE1VgmfCuFzFrQripZ_endElbvEhU1rZawQgV3RI-v3II8fDslI1sdC_WKBkmtxS3jxuIihk33Q", desc: "Mạng xã hội lớn nhất", url: "market://details?id=com.facebook.katana" },
    { name: "Messenger", pkg: "com.facebook.orca", iconUrl: "https://play-lh.googleusercontent.com/cuRpiGqvAMkcbAOibD-AKCBagAunUkspQUWC_jVZF2Hob_ODdmkefnZeqkofW1idFQHhgZgnLIjsqT-2v7JKBw", desc: "Ứng dụng nhắn tin của Facebook", url: "market://details?id=com.facebook.orca" },
    { name: "Sacombank mBanking", pkg: "com.sacombank.mBanking", iconUrl: "https://logo.clearbit.com/sacombank.com.vn", desc: "Ngân hàng số Sacombank", url: "market://details?id=com.sacombank.mBanking" },
    { name: "MyVIB", pkg: "com.vib.myvib", iconUrl: "https://logo.clearbit.com/vib.com.vn", desc: "Ngân hàng số VIB", url: "market://details?id=com.vib.myvib" },
    { name: "Vietcombank", pkg: "com.VCB", iconUrl: "https://logo.clearbit.com/vietcombank.com.vn", desc: "Ngân hàng Vietcombank", url: "market://details?id=com.VCB" },
    { name: "MB Bank", pkg: "com.mbmobile", iconUrl: "https://logo.clearbit.com/mbbank.com.vn", desc: "Ngân hàng Quân Đội MBBank", url: "market://details?id=com.mbmobile" },
  ];

  const filteredApps = useMemo(() => {
    return appsList.filter(app => 
      app.name.toLowerCase().includes(search.toLowerCase()) || 
      app.desc.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openApp = (url: string) => {
    window.location.href = url;
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
        {filteredApps.map((app, i) => (
          <div className="list-item" key={i}>
            <div className="item-icon" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
              <img 
                 src={app.iconUrl} 
                 alt={app.name} 
                 style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                 onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxMS41YTguMzggOC4zOCAwIDAgMS0uOSAzLjggOC41IDguNSAwIDAgMS03LjYgNC43IDguMzggOC4zOCAwIDAgMS0zLjgtLjlMMyAyMWwxLjktNS43YTguMzggOC4zOCAwIDAgMS0uOS0zLjggOC41IDguNSAwIDAgMSA0LjctNy42IDguMzggOC4zOCAwIDAgMSAzLjgtLjloLjVhOC40OCA4LjQ4IDAgMCAxIDggOHYuNXoiPjwvcGF0aD48L3N2Zz4='; }}
              />
            </div>
            <div className="item-info">
              <span className="item-title">{app.name}</span>
              <span className="item-desc">{app.desc}</span>
            </div>
            <button className="btn btn-primary" onClick={() => openApp(app.url)} style={{ padding: '6px 12px', fontSize: '11px', minWidth: '70px', background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={14} /> Mở
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
