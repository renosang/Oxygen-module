import { DownloadCloud, Play, Download } from 'lucide-react';

export default function ApkTab() {
  const mockApks = [
    { name: 'Zalo', version: 'v23.11.2', installed: false },
    { name: 'MoMo', version: 'v4.0.12', installed: true },
    { name: 'Vietcombank', version: 'v5.6.9', installed: false },
  ];

  return (
    <div className="glass-card" style={{ animationDelay: '0.3s' }}>
      <div className="card-title">
        <DownloadCloud className="text-cyan" size={20} />
        <span>Kho Ứng Dụng Việt Nam</span>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '16px', lineHeight: 1.5 }}>
        Cài đặt nhanh các ứng dụng phổ biến tại Việt Nam. Các ứng dụng sẽ được tải trực tiếp từ server an toàn.
      </div>

      <div className="list-container">
        {mockApks.map((apk, i) => (
          <div className="list-item" key={i}>
            <div className="item-icon" style={{ background: apk.installed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: apk.installed ? 'var(--accent-green)' : 'var(--text-sub)' }}>
              <Play size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">{apk.name}</span>
              <span className="item-desc">Phiên bản: {apk.version}</span>
            </div>
            <button className={`btn ${apk.installed ? '' : 'btn-primary'}`} style={{ padding: '6px 12px', fontSize: '11px', minWidth: '70px' }}>
              {apk.installed ? 'Đã cài' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={14} /> Tải về
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
