import { useState } from 'react';
import { Snowflake, Search, RefreshCw, Box } from 'lucide-react';

export default function FreezeTab() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const mockApps = [
    { name: 'App Market', pkg: 'com.heytap.market', frozen: true },
    { name: 'Theme Store', pkg: 'com.heytap.themestore', frozen: true },
    { name: 'Facebook', pkg: 'com.facebook.katana', frozen: false },
  ];

  return (
    <div className="glass-card" style={{ animationDelay: '0.2s' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Snowflake className="text-cyan" size={20} />
          <span>Tất Cả Ứng Dụng</span>
        </div>
        <button className="btn" onClick={() => setLoading(true)}>
          <RefreshCw size={14} className={loading ? 'spinner' : ''} /> 
          Tải lại
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-sub)' }} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Tìm kiếm ứng dụng..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '38px', marginBottom: 0 }}
        />
      </div>

      <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginBottom: '12px', fontWeight: 600 }}>
        Tìm thấy {mockApps.length} ứng dụng hệ thống
      </div>

      <div className="list-container" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
        {mockApps.map((app, i) => (
          <div className="list-item" key={i}>
            <div className="item-icon">
              <Box size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">{app.name}</span>
              <span className="item-desc">{app.pkg}</span>
            </div>
            <button className={`btn ${app.frozen ? 'btn-primary' : ''}`} style={{ padding: '6px 12px', fontSize: '11px', minWidth: '85px' }}>
              {app.frozen ? 'Đã đóng băng' : 'Đóng băng'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
