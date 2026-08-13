import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function DebloatTweak({ showAlert, logMsg }: { showAlert: (msg: string) => void, logMsg: (msg: string) => void }) {
  const { runShell } = useKsu();
  const [showDebloatModal, setShowDebloatModal] = useState(false);
  const [isScanningDebloat, setIsScanningDebloat] = useState(false);
  
  type DebloatApp = {
    pkg: string;
    name: string;
    desc: string;
    risk: 'Low' | 'Medium' | 'High';
    available?: boolean;
    disabled?: boolean;
  };

  const [debloatApps, setDebloatApps] = useState<DebloatApp[]>([]);

  const DEBLOAT_LIST: DebloatApp[] = [
    { pkg: "com.heytap.market", name: "App Market", desc: "Chợ ứng dụng mặc định", risk: "Low" },
    { pkg: "com.heytap.themestore", name: "Theme Store", desc: "Cửa hàng chủ đề", risk: "Low" },
    { pkg: "com.heytap.browser", name: "Browser", desc: "Trình duyệt mặc định", risk: "Low" },
    { pkg: "com.heytap.cloud", name: "HeyTap Cloud", desc: "Đồng bộ đám mây", risk: "Medium" },
    { pkg: "com.heytap.usercenter", name: "User Center", desc: "Trung tâm người dùng", risk: "Medium" },
    { pkg: "com.heytap.smarthome", name: "Smart Home", desc: "Quản lý thiết bị IoT", risk: "Low" },
    { pkg: "com.coloros.gamespace", name: "Game Space", desc: "Không gian trò chơi", risk: "Low" },
    { pkg: "com.coloros.childrenspace", name: "Kid Space", desc: "Không gian trẻ em", risk: "Low" },
    { pkg: "com.coloros.wallet", name: "Wallet", desc: "Ví điện tử mặc định", risk: "Medium" },
    { pkg: "com.coloros.weather.service", name: "Weather Service", desc: "Dịch vụ thời tiết", risk: "Low" },
    { pkg: "com.coloros.securepay", name: "Secure Pay", desc: "Bảo mật thanh toán", risk: "High" },
    { pkg: "com.oplus.pay", name: "OPlus Pay", desc: "Dịch vụ thanh toán", risk: "High" },
    { pkg: "com.oplus.games", name: "Games", desc: "Trò chơi", risk: "Low" },
    { pkg: "com.oplus.safecenter", name: "Safe Center", desc: "Trung tâm bảo mật", risk: "Medium" },
    { pkg: "com.oplus.breeno", name: "Breeno", desc: "Trợ lý ảo", risk: "Low" },
    { pkg: "com.oppo.music", name: "Music", desc: "Trình phát nhạc", risk: "Low" },
    { pkg: "com.oneplus.mall", name: "OnePlus Store", desc: "Cửa hàng mua sắm", risk: "Low" },
    { pkg: "com.oneplus.account", name: "OnePlus Account", desc: "Tài khoản OnePlus", risk: "Medium" },
    { pkg: "com.oneplus.gamespace", name: "OP Game Space", desc: "Không gian trò chơi OP", risk: "Low" },
    { pkg: "com.oneplus.tvremote", name: "TV Remote", desc: "Điều khiển TV", risk: "Low" },
    { pkg: "com.facebook.appmanager", name: "FB App Manager", desc: "Quản lý ứng dụng Facebook", risk: "Low" },
    { pkg: "com.facebook.services", name: "FB Services", desc: "Dịch vụ nền Facebook", risk: "Low" },
    { pkg: "com.facebook.system", name: "FB System", desc: "Hệ thống Facebook", risk: "Low" },
    { pkg: "com.netflix.partner.activation", name: "Netflix Activation", desc: "Dịch vụ đối tác Netflix", risk: "Low" }
  ];

  const openDebloatManager = async () => {
    setShowDebloatModal(true);
    setIsScanningDebloat(true);
    setDebloatApps([]);
    
    try {
      const disRes = await runShell("pm list packages -d -u --user 0 2>/dev/null");
      const disabledPkgs = disRes.stdout.split('\\n').filter(l => l.includes('package:')).map(l => l.replace('package:', '').trim());

      let allPkgs: string[] = [];
      const ksu = (window as any).ksu;
      
      if (ksu && typeof ksu.listPackages === 'function') {
         try {
            const pkgs = JSON.parse(ksu.listPackages("all"));
            if (pkgs && pkgs.length > 0) allPkgs = pkgs;
         } catch(e) {}
      }

      if (allPkgs.length === 0) {
         const allRes = await runShell("pm list packages -u 2>/dev/null");
         allPkgs = allRes.stdout.split('\\n').filter(l => l.includes('package:')).map(l => l.replace('package:', '').trim());
      }
      
      const parsedApps = DEBLOAT_LIST.map(app => {
        const available = allPkgs.includes(app.pkg);
        const disabled = disabledPkgs.includes(app.pkg);
        return { ...app, available, disabled };
      }).filter(app => app.available);
      
      setDebloatApps(parsedApps);
    } catch (e) {
      logMsg("Lỗi khi quét ứng dụng.");
    }
    setIsScanningDebloat(false);
  };

  const toggleDebloatApp = async (pkg: string, disable: boolean) => {
    const cmd = disable ? `pm disable-user --user 0 ${pkg}` : `pm enable ${pkg}`;
    await runShell(cmd);
    setDebloatApps(prev => prev.map(a => a.pkg === pkg ? { ...a, disabled: disable } : a));
  };

  const disableAllLowRisk = async () => {
    const lowRiskApps = debloatApps.filter(a => a.risk === 'Low' && !a.disabled);
    for (const app of lowRiskApps) {
      await runShell(`pm disable-user --user 0 ${app.pkg}`);
      setDebloatApps(prev => prev.map(a => a.pkg === app.pkg ? { ...a, disabled: true } : a));
    }
    showAlert(`Đã vô hiệu hóa ${lowRiskApps.length} ứng dụng rủi ro thấp!`);
  };

  return (
    <>
      <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div className="item-icon" style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <Trash2 size={20} />
          </div>
          <div className="item-info">
            <span className="item-title">Quản Lý Bloatware</span>
            <span className="item-desc">Vô hiệu hóa an toàn ứng dụng rác</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={openDebloatManager}>Quản Lý Debloat</button>
        </div>
      </div>

      {showDebloatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '95%', maxWidth: '450px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '16px' }}>Debloat Manager</h3>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                Ứng dụng bị vô hiệu hóa sẽ mất khỏi launcher nhưng <b>không bị xóa khỏi hệ thống</b>. Bạn có thể bật lại bất cứ lúc nào.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'white' }}>Đã tìm thấy: <b style={{ color: 'var(--accent-cyan)' }}>{debloatApps.length}</b> apps</span>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={disableAllLowRisk} disabled={isScanningDebloat || debloatApps.filter(a => a.risk === 'Low' && !a.disabled).length === 0}>
                Vô hiệu hóa (Risk: Low)
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px' }}>
              {isScanningDebloat ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-sub)' }}>Đang quét ứng dụng...</div>
              ) : debloatApps.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-sub)' }}>Không tìm thấy ứng dụng rác nào.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {debloatApps.map((app) => (
                    <div key={app.pkg} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '12px' }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{app.name}</span>
                        <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>{app.desc}</span>
                        <span style={{ fontSize: '10px', marginTop: '4px', color: app.risk === 'Low' ? 'var(--accent-green)' : app.risk === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>Rủi ro: {app.risk}</span>
                      </div>
                      <div className={`switch ${!app.disabled ? 'active' : ''}`} onClick={() => toggleDebloatApp(app.pkg, !app.disabled)}>
                        <div className="switch-handle"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowDebloatModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}
