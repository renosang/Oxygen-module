import { Settings2, Image, ShieldAlert, Zap, BatteryCharging } from 'lucide-react';

export default function TweaksTab() {
  return (
    <div className="glass-card" style={{ animationDelay: '0.4s' }}>
      <div className="card-title">
        <Settings2 className="text-cyan" size={20} />
        <span>Tiện Ích Mở Rộng</span>
      </div>

      <div className="list-container" style={{ maxHeight: 'none', paddingRight: 0 }}>
        
        {/* Google Photos */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-yellow)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Image size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Google Photos Không Giới Hạn</span>
              <span className="item-desc">Sao lưu ảnh chất lượng gốc miễn phí (Fake Pixel)</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Bật Tính Năng Này</button>
        </div>

        {/* Ad Blocker */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Systemless Ad-Blocker</span>
              <span className="item-desc">Chặn quảng cáo toàn hệ thống thông qua hosts</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-danger" style={{ flex: 1 }}>Bật Chặn QC</button>
            <button className="btn" style={{ flex: 1 }}>Cập Nhật Data</button>
          </div>
        </div>

        {/* Performance Profiles */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}>
              <Zap size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Cấu hình Hiệu năng (Profiles)</span>
              <span className="item-desc">Điều chỉnh xung nhịp CPU theo nhu cầu sử dụng</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn" style={{ flex: 1, padding: '8px 4px', fontSize: '11px', flexDirection: 'column' }}>
              <BatteryCharging size={16} className="text-green" style={{ marginBottom: '4px' }} />
              Tiết Kiệm
            </button>
            <button className="btn" style={{ flex: 1, padding: '8px 4px', fontSize: '11px', flexDirection: 'column', background: 'rgba(255,255,255,0.1)', borderColor: 'var(--accent-cyan)' }}>
              <Settings2 size={16} className="text-cyan" style={{ marginBottom: '4px' }} />
              Cân Bằng
            </button>
            <button className="btn" style={{ flex: 1, padding: '8px 4px', fontSize: '11px', flexDirection: 'column' }}>
              <Zap size={16} className="text-red" style={{ marginBottom: '4px' }} />
              Hiệu Năng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
