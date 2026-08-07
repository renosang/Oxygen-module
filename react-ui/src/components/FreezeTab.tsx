import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Snowflake, Search, RefreshCw, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useKsu } from '../hooks/useKsu';

interface AppInfo {
  pkg: string;
  label: string;
  isSystem: boolean;
  isFrozen: boolean;
  loading?: boolean;
  icon?: string;
}

// Hàm tạo màu ngẫu nhiên nhưng cố định theo tên app
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function FreezeTab() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filter, setFilter] = useState<'all' | 'user' | 'system' | 'frozen'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const { hasRoot, runShell } = useKsu();

  const fetchApps = async () => {
    if (!hasRoot) return;
    setLoading(true);
    try {
      const disRes = await runShell("pm list packages -d 2>/dev/null || cmd package list packages -d 2>/dev/null", 5000);
      const disabledMap = new Set<string>();
      if (disRes.stdout) {
        disRes.stdout.split('\n').forEach(line => {
          const pkg = line.replace('package:', '').trim();
          if (pkg) disabledMap.add(pkg);
        });
      }

      let fetchedApps: AppInfo[] = [];

      const ksu = (window as any).ksu;
      if (ksu && typeof ksu.listPackages === 'function' && typeof ksu.getPackagesInfo === 'function') {
        try {
          const pkgs = JSON.parse(ksu.listPackages("all"));
          if (pkgs && pkgs.length > 0) {
            const infos = JSON.parse(ksu.getPackagesInfo(JSON.stringify(pkgs)));
            fetchedApps = infos.map((info: any) => {
              return {
                pkg: info.packageName,
                label: info.appLabel || info.packageName,
                isSystem: info.isSystem,
                isFrozen: disabledMap.has(info.packageName),
                loading: false,
                icon: `ksu://icon/${info.packageName}`
              };
            });
          }
        } catch(e) {
          console.error("KSU list error", e);
        }
      }

      if (fetchedApps.length === 0) {
         const listRes = await runShell("pm list packages -f -u --user 0 2>/dev/null || cmd package list packages -f -u --user 0 2>/dev/null || pm list packages -f 2>/dev/null", 10000);
         if (listRes.stdout) {
            const systemPrefixes = ["com.android", "android", "com.google", "com.qualcomm", "com.oneplus", "com.oem", "com.oplus"];
            listRes.stdout.split('\n').forEach(line => {
               line = line.trim();
               if (!line || !line.includes('=')) return;
               let pkgName = line.split('=').pop() || '';
               if (!pkgName || !pkgName.includes('.')) return;
               
               let isSystem = true;
               if (line.includes('/data/app/')) isSystem = false;
               else {
                 isSystem = systemPrefixes.some(p => pkgName.startsWith(p));
               }
               fetchedApps.push({
                 pkg: pkgName,
                 label: pkgName,
                 isSystem,
                 isFrozen: disabledMap.has(pkgName),
                 loading: false
               });
            });
         }
      }
      
      fetchedApps.sort((a, b) => {
         if (a.isFrozen !== b.isFrozen) return a.isFrozen ? -1 : 1;
         if (a.isSystem !== b.isSystem) return a.isSystem ? 1 : -1;
         return a.label.localeCompare(b.label);
      });

      setApps(fetchedApps);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRoot]);

  const confirmFreeze = (app: AppInfo) => {
     if (app.isSystem && !app.isFrozen) {
        setSelectedApp(app);
        setModalOpen(true);
     } else {
        executeToggle(app.pkg, app.isFrozen);
     }
  };

  const executeToggle = async (pkg: string, isFrozen: boolean) => {
     setModalOpen(false);
     setApps(apps.map(a => a.pkg === pkg ? { ...a, loading: true } : a));
     
     let success = false;
     if (isFrozen) {
         let res = await runShell(`cmd package enable --user 0 ${pkg}`);
         if (res.errno !== 0) res = await runShell(`pm enable ${pkg}`);
         if (res.errno === 0 || res.stdout.includes('new state')) success = true;
     } else {
         let res = await runShell(`cmd package disable-user --user 0 ${pkg}`);
         if (res.errno !== 0) res = await runShell(`pm disable ${pkg}`);
         if (res.errno === 0 || res.stdout.includes('new state')) success = true;
     }
     
     setApps(apps.map(a => {
        if (a.pkg === pkg) {
           return { ...a, loading: false, isFrozen: success ? !isFrozen : isFrozen };
        }
        return a;
     }));
  };

  const filteredApps = useMemo(() => {
     return apps.filter(app => {
        if (filter === 'user' && app.isSystem) return false;
        if (filter === 'system' && !app.isSystem) return false;
        if (filter === 'frozen' && !app.isFrozen) return false;
        if (search && !app.label.toLowerCase().includes(search.toLowerCase()) && !app.pkg.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
     });
  }, [apps, filter, search]);

  return (
    <div className="glass-card" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Custom Modal for System App Warning using Portal */}
      {modalOpen && selectedApp && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', animation: 'slide-up 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-red)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Cảnh báo nguy hiểm</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '8px', lineHeight: 1.5 }}>
              Bạn đang chuẩn bị Đóng Băng một ứng dụng Hệ Thống:
            </p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '16px', wordBreak: 'break-all' }}>
              {selectedApp.label}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '24px', lineHeight: 1.5, background: 'rgba(239,68,68,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
              Việc vô hiệu hóa sai ứng dụng hệ thống có thể gây ra lỗi nghiêm trọng, đứng máy, hoặc điện thoại sẽ tự động khởi động lại (Bootloop).
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}>Hủy</button>
              <button className="btn" onClick={() => executeToggle(selectedApp.pkg, selectedApp.isFrozen)} style={{ background: 'var(--accent-red)', color: 'white', border: 'none', flex: 1 }}>Tiếp tục</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="card-title" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Snowflake className="text-cyan" size={20} />
          <span>Đóng Băng Ứng Dụng</span>
        </div>
        <button className="btn" onClick={fetchApps} disabled={loading} style={{ padding: '6px 12px' }}>
          <RefreshCw size={14} className={loading ? 'spinner' : ''} /> 
          Tải lại
        </button>
      </div>

      <div className="nav-tabs" style={{ marginBottom: '16px' }}>
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả
        </button>
        <button className={`tab-btn ${filter === 'user' ? 'active' : ''}`} onClick={() => setFilter('user')}>
          Cá nhân
        </button>
        <button className={`tab-btn ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>
          Hệ thống
        </button>
        <button className={`tab-btn ${filter === 'frozen' ? 'active' : ''}`} onClick={() => setFilter('frozen')}>
          Đóng băng
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-sub)' }} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Tìm kiếm ứng dụng hoặc package..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '38px', marginBottom: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text-sub)', marginBottom: '8px', padding: '0 4px' }}>
        <span>Tìm thấy <strong style={{color: 'var(--accent-cyan)'}}>{filteredApps.length}</strong> ứng dụng</span>
        {filter === 'all' && apps.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                Cá nhân: {apps.filter(a => !a.isSystem).length}
             </span>
             <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }}></span>
                Hệ thống: {apps.filter(a => a.isSystem).length}
             </span>
          </div>
        )}
      </div>

      <div className="list-container" style={{ flex: 1, minHeight: '300px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
        {loading && apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-sub)' }}>
            <RefreshCw size={32} className="spinner text-cyan" style={{ marginBottom: '16px', margin: '0 auto' }} />
            <p>Đang quét danh sách ứng dụng...</p>
            <p style={{ fontSize: '11px', marginTop: '4px' }}>Quá trình này có thể mất vài giây</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-sub)' }}>
            <Snowflake size={32} style={{ opacity: 0.5, margin: '0 auto 12px' }} />
            <p>Không tìm thấy ứng dụng nào</p>
          </div>
        ) : (
          filteredApps.map((app, i) => (
            <div className="list-item" key={app.pkg + i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="item-icon" style={{ 
                  position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent',
                  color: 'white', fontWeight: 'bold', fontSize: '16px',
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0
              }}>
                 <img 
                    src={app.icon || ''} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt="icon" 
                    onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                       const parent = (e.target as HTMLImageElement).parentElement;
                       if (parent) {
                          parent.style.background = stringToColor(app.label);
                          parent.innerHTML = app.label.charAt(0).toUpperCase();
                       }
                    }}
                 />
              </div>
              <div className="item-info" style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: app.isFrozen ? 'var(--text-sub)' : 'white', flex: 1 }}>
                    {app.label}
                  </span>
                </div>
                <span className="item-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: app.isFrozen ? 'rgba(255,255,255,0.3)' : 'var(--text-sub)' }}>
                  {app.pkg}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Fixed dot indicator for System/User */}
                <span style={{ 
                   display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                   background: app.isSystem ? 'var(--accent-red)' : 'var(--accent-green)',
                   boxShadow: `0 0 6px ${app.isSystem ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.6)'}`
                }} title={app.isSystem ? 'Hệ thống' : 'Cá nhân'}></span>
                
                <button 
                  className={`btn ${app.isFrozen ? 'is-active' : ''}`} 
                  style={{ 
                     padding: '8px', 
                     minWidth: '40px', 
                     background: app.isFrozen ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.05)',
                     borderColor: app.isFrozen ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.1)',
                     color: app.isFrozen ? 'var(--accent-cyan)' : 'white'
                  }}
                  disabled={app.loading}
                  onClick={() => confirmFreeze(app)}
                  title={app.isFrozen ? 'Mở băng' : 'Đóng băng'}
                >
                  {app.loading ? (
                    <RefreshCw size={16} className="spinner" />
                  ) : app.isFrozen ? (
                    <Lock size={16} />
                  ) : (
                    <Unlock size={16} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
