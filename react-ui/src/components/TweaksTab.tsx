import { Settings2, Image, ShieldAlert, Monitor, Activity, Trash2, Globe, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useKsu } from '../hooks/useKsu';

export default function TweaksTab({ isActive }: { isActive: boolean }) {
  const { hasRoot, runShell } = useKsu();
  const [logs, setLogs] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  
  // States for toggles/buttons
  const [adblockStatus, setAdblockStatus] = useState(false);
  const [gmsDoze, setGmsDoze] = useState(false);
  const [dns, setDns] = useState('default');
  const [refreshRate, setRefreshRate] = useState(120);
  const [antiKill, setAntiKill] = useState(false);
  const [animScale, setAnimScale] = useState(1);
  const [photosEnabled, setPhotosEnabled] = useState(false);
  
  // Modal Debloat
  const [showDebloatModal, setShowDebloatModal] = useState(false);
  const [debloatProgress, setDebloatProgress] = useState(0);
  const [debloatLog, setDebloatLog] = useState<string[]>([]);
  const [isDebloating, setIsDebloating] = useState(false);

  const bloatwareList = [
    "com.heytap.market", "com.heytap.themestore", "com.heytap.browser", "com.heytap.cloud",
    "com.heytap.usercenter", "com.heytap.smarthome", "com.heytap.music", "com.heytap.video",
    "com.coloros.gamespace", "com.coloros.childrenspace", "com.coloros.focusmode", "com.coloros.wallet",
    "com.oplus.appmarket", "com.oplus.theme", "com.oplus.pay", "com.oplus.community",
    "com.oplus.games", "com.oplus.safecenter", "com.oplus.breeno",
    "com.oneplus.mall", "com.oneplus.account", "com.oneplus.membership"
  ];

  const logMsg = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const getModPath = () => "/data/adb/modules/oneplus_customize";

  // Boot Script helper
  const updateBootScript = async (key: string, cmd: string, remove: boolean = false) => {
    const modpath = getModPath();
    const bootFile = `${modpath}/tweaks_boot.sh`;
    if (remove) {
      await runShell(`sed -i '/#${key}/d' ${bootFile}`);
      await runShell(`sed -i '/${cmd.replace(/\//g, '\\/')}/d' ${bootFile}`);
    } else {
      await runShell(`mkdir -p ${modpath} && touch ${bootFile}`);
      // Remove old then add new
      await runShell(`sed -i '/#${key}/d' ${bootFile}`);
      await runShell(`echo "#${key}" >> ${bootFile} && echo "${cmd}" >> ${bootFile}`);
    }
  };

  // Custom Modal State
  const [modalMsg, setModalMsg] = useState('');

  const showAlert = (msg: string) => {
    setModalMsg(msg);
  };

  // 1. Google Photos
  const enablePhotos = async () => {
    logMsg("Đang kích hoạt Google Photos (Fake Pixel)...");
    const modpath = getModPath();
    await runShell(`sh ${modpath}/enable_photos.sh ${modpath}`);
    setPhotosEnabled(true);
    showAlert("Kích hoạt Google Photos thành công! Vui lòng khởi động lại máy.");
  };

  // 2. AdBlock
  const checkAdblock = async () => {
    const res = await runShell(`[ -f "${getModPath()}/system/etc/hosts" ] && echo "ON" || echo "OFF"`);
    setAdblockStatus(res.stdout.trim() === "ON");
  };

  const toggleAdblock = async () => {
    if (adblockStatus) {
      logMsg("Đang tắt Ad-Blocker...");
      await runShell(`rm -f ${getModPath()}/system/etc/hosts`);
      setAdblockStatus(false);
      showAlert("Đã tắt Ad-Blocker. Vui lòng khởi động lại thiết bị.");
    } else {
      logMsg("Đang tải dữ liệu Ad-Blocker...");
      await runShell(`mkdir -p ${getModPath()}/system/etc && curl -s -o ${getModPath()}/system/etc/hosts "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"`);
      await runShell(`chmod 644 ${getModPath()}/system/etc/hosts`);
      setAdblockStatus(true);
      showAlert("Tải file hosts thành công! Vui lòng khởi động lại máy để áp dụng.");
    }
  };

  // 3. Debloat
  const runDebloat = async (restore: boolean = false) => {
    setShowDebloatModal(true);
    setIsDebloating(true);
    setDebloatLog([]);
    setDebloatProgress(0);
    
    let count = 0;
    for (let i = 0; i < bloatwareList.length; i++) {
      const pkg = bloatwareList[i];
      const cmd = restore ? `pm enable ${pkg}` : `pm disable-user --user 0 ${pkg}`;
      const res = await runShell(cmd);
      setDebloatProgress(Math.round(((i + 1) / bloatwareList.length) * 100));
      if (res.stdout.includes("new state")) {
        count++;
        setDebloatLog(prev => [...prev, `✓ ${restore ? 'Khôi phục' : 'Vô hiệu hóa'}: ${pkg}`]);
      }
    }
    setDebloatLog(prev => [...prev, `✨ Hoàn tất! Đã xử lý ${count}/${bloatwareList.length} ứng dụng.`]);
    setIsDebloating(false);
  };

  // 4. Removed CPU Profiles

  // 5. GMS Doze
  const applyGmsDoze = async (enable: boolean) => {
    setGmsDoze(enable);
    if (enable) {
      const cmd = `dumpsys deviceidle whitelist -com.google.android.gms; pm disable-user --user 0 com.google.android.gms/com.google.android.gms.chimera.GmsIntentOperationService; pm disable-user --user 0 com.google.android.gms/com.google.android.gms.auth.api.signin.RevocationBoundService`;
      await runShell(cmd);
      await updateBootScript('GMS_DOZE', cmd, false);
      logMsg("Tối ưu GMS thành công!");
    } else {
      const cmd = `dumpsys deviceidle whitelist +com.google.android.gms; pm enable com.google.android.gms/com.google.android.gms.chimera.GmsIntentOperationService; pm enable com.google.android.gms/com.google.android.gms.auth.api.signin.RevocationBoundService`;
      await runShell(cmd);
      await updateBootScript('GMS_DOZE', '', true); // Remove from boot script
      logMsg("Đã khôi phục GMS thành công.");
    }
  };

  // 6. DNS Manager
  const applyDNS = async (server: string) => {
    setDns(server);
    let cmd = `settings put global private_dns_mode opportunistic`;
    if (server === 'cloudflare') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier 1dot1dot1dot1.cloudflare-dns.com`;
    else if (server === 'google') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.google`;
    else if (server === 'adguard') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.adguard.com`;
    
    await runShell(cmd);
    logMsg(`Đã chuyển đổi DNS sang ${server.toUpperCase()}`);
  };

  // 7. Refresh Rate
  const applyRefreshRate = async (rate: number | 'auto') => {
    setRefreshRate(rate as any);
    let cmd = "";
    if (rate === 'auto') {
      cmd = `settings delete system peak_refresh_rate; settings delete system min_refresh_rate; settings delete secure refresh_rate_mode; settings delete global oneplus_screen_refresh_rate; settings delete secure user_refresh_rate`;
      await runShell(cmd);
      await updateBootScript('REFRESH_RATE', '', true);
      logMsg(`Đã chuyển về chế độ Tương Thích (Tự động)`);
    } else {
      cmd = `settings put system peak_refresh_rate ${rate}.0; settings put system min_refresh_rate ${rate}.0; settings put secure min_refresh_rate ${rate}.0; settings put secure peak_refresh_rate ${rate}.0; settings put secure refresh_rate_mode 2; settings put global oneplus_screen_refresh_rate 2; settings put global oppo_screen_refresh_rate 2; settings put secure user_refresh_rate ${rate}`;
      await runShell(cmd);
      await updateBootScript('REFRESH_RATE', cmd, false);
      logMsg(`Ép xung màn hình ${rate}Hz thành công!`);
    }
  };

  // 8. Anti Kill
  const applyAntiKill = async (enable: boolean) => {
    setAntiKill(enable);
    if (enable) {
      const cmd = `device_config put activity_manager max_phantom_processes 8192; settings put global settings_enable_monitor_phantom_procs false; settings put global activity_manager_constants max_cached_processes=128`;
      await runShell(cmd);
      await updateBootScript('ANTI_KILL', cmd, false);
      logMsg("Đã tắt Phantom Process Killer!");
    } else {
      await updateBootScript('ANTI_KILL', '', true);
      logMsg("Khôi phục Anti-Kill (Chờ reboot).");
    }
  };

  // 9. Deep Clean
  const runDeepClean = async () => {
    logMsg("Đang dọn rác hệ thống...");
    await runShell(`rm -rf /data/log/*; rm -rf /data/tombstones/*; rm -rf /data/anr/*; rm -rf /data/local/tmp/*; pm trim-caches 9999999999999`);
    showAlert("Đã dọn dẹp hệ thống thành công! Giải phóng lượng lớn không gian rác.");
    logMsg("Dọn dẹp thành công!");
  };

  // 10. Animation & DPI
  const applyAnim = async (scale: number) => {
    setAnimScale(scale);
    const cmd = `settings put global window_animation_scale ${scale}; settings put global transition_animation_scale ${scale}; settings put global animator_duration_scale ${scale}`;
    await runShell(cmd);
    logMsg(`Thay đổi tốc độ hiệu ứng: ${scale}x`);
  };

  const applyDPI = async (val: string) => {
    const cmd = val === 'reset' ? 'wm density reset' : `wm density ${val}`;
    await runShell(cmd);
    logMsg(val === 'reset' ? 'Đã khôi phục DPI mặc định' : `Đã đổi DPI sang ${val}`);
  };

  // Initialize status on load
  useEffect(() => {
    if (hasRoot && isActive && !hasFetched) {
      checkAdblock();
      // Attempt to read boot script or system props to pre-select states (mocking for UI)
      runShell("settings get global private_dns_specifier").then(res => {
        if (res.stdout.includes("cloudflare")) setDns('cloudflare');
        else if (res.stdout.includes("google")) setDns('google');
        else if (res.stdout.includes("adguard")) setDns('adguard');
      });
      runShell("settings get secure user_refresh_rate").then(res => {
        const rate = parseInt(res.stdout);
        if ([60,90,120].includes(rate)) setRefreshRate(rate);
      });
      runShell("settings get global animator_duration_scale").then(res => {
        const val = parseFloat(res.stdout);
        if (!isNaN(val)) setAnimScale(val);
      });
      setHasFetched(true);
    }
  }, [hasRoot, isActive]);

  return (
    <div className="glass-card" style={{ animationDelay: '0.4s', paddingBottom: '80px' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>
        <Settings2 className="text-cyan" size={20} />
        <span>Tiện Ích Mở Rộng & Tối Ưu</span>
      </div>

      {logs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', color: 'var(--cyan)' }}>
          {logs[0]}
        </div>
      )}

      <div className="list-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '4px' }}>
        
        {/* Google Photos */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-yellow)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Image size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Google Photos Unlimited</span>
              <span className="item-desc">Sao lưu ảnh không giới hạn (Fake Pixel)</span>
            </div>
          </div>
          <button className={`btn ${photosEnabled ? 'btn-cancel' : 'btn-primary'}`} style={{ width: '100%' }} onClick={enablePhotos}>
            {photosEnabled ? 'Đã Kích Hoạt (Khởi động lại máy)' : 'Kích Hoạt Tính Năng Này'}
          </button>
        </div>

        {/* Ad Blocker */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Systemless Ad-Blocker</span>
              <span className="item-desc">Chặn quảng cáo qua Hosts {adblockStatus && <span className="text-green">(Đang bật)</span>}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn ${adblockStatus ? 'btn-cancel' : 'btn-primary'}`} style={{ flex: 1 }} onClick={toggleAdblock}>
              {adblockStatus ? 'Tắt Adblock' : 'Bật Adblock'}
            </button>
          </div>
        </div>

        {/* Debloat */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)' }}>
              <Trash2 size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">1-Click Debloat</span>
              <span className="item-desc">Vô hiệu hóa ứng dụng rác ColorOS/OxygenOS</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }} onClick={() => runDebloat(false)}>Dọn Rác Ngay</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => runDebloat(true)}>Khôi Phục</button>
          </div>
        </div>

        {/* Performance Profiles Removed */}
        {/* Anti-Kill & GMS Doze */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.1)' }}>
              <Activity size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Tối Ưu Đa Nhiệm & Pin</span>
              <span className="item-desc">Kiểm soát RAM & Google Services</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'white' }}>Chống văng App (Anti-Kill)</span>
              <div className={`switch ${antiKill ? 'active' : ''}`} onClick={() => applyAntiKill(!antiKill)}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'white' }}>Tiết kiệm Pin GMS (Doze)</span>
              <div className={`switch ${gmsDoze ? 'active' : ''}`} onClick={() => applyGmsDoze(!gmsDoze)}></div>
            </div>
          </div>
        </div>

        {/* Refresh Rate */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
              <Monitor size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Tần Số Quét Màn Hình</span>
              <span className="item-desc">Khóa hoặc Auto Refresh Rate</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className={`btn ${refreshRate as any === 'auto' ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyRefreshRate('auto')}>Tương Thích</button>
            {[60, 90, 120].map(r => (
              <button key={r} className={`btn ${refreshRate === r ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyRefreshRate(r)}>{r}Hz</button>
            ))}
          </div>
        </div>

        {/* Animations & DPI */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-orange)', background: 'rgba(249, 115, 22, 0.1)' }}>
              <Sparkles size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Giao Diện & Hoạt Ảnh</span>
              <span className="item-desc">Tốc độ chuyển cảnh và Độ phân giải</span>
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: 'white', marginBottom: '8px' }}>Tốc Độ Hiệu Ứng</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <button className={`btn ${animScale === 1 ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyAnim(1)}>Mặc định</button>
            <button className={`btn ${animScale === 0.5 ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyAnim(0.5)}>Nhanh 0.5x</button>
            <button className={`btn ${animScale === 0 ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyAnim(0)}>Tắt hẳn</button>
          </div>

          <div style={{ fontSize: '12px', color: 'white', marginBottom: '8px' }}>Điều Chỉnh DPI</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn" style={{ flex: 1, fontSize: '11px' }} onClick={() => applyDPI('reset')}>Mặc định</button>
            <button className="btn" style={{ flex: 1, fontSize: '11px' }} onClick={() => applyDPI('450')}>Vừa (450)</button>
            <button className="btn" style={{ flex: 1, fontSize: '11px' }} onClick={() => applyDPI('500')}>Nhỏ (500)</button>
          </div>
        </div>

        {/* DNS */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}>
              <Globe size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Đổi DNS Cấp Tốc</span>
              <span className="item-desc">Vượt rào / Chặn QC qua DNS</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button className={`btn ${dns === 'default' ? 'btn-primary' : ''}`} style={{ flex: '1 1 40%', fontSize: '11px' }} onClick={() => applyDNS('default')}>Mặc Định</button>
            <button className={`btn ${dns === 'cloudflare' ? 'btn-primary' : ''}`} style={{ flex: '1 1 40%', fontSize: '11px' }} onClick={() => applyDNS('cloudflare')}>1.1.1.1</button>
            <button className={`btn ${dns === 'google' ? 'btn-primary' : ''}`} style={{ flex: '1 1 40%', fontSize: '11px' }} onClick={() => applyDNS('google')}>Google</button>
            <button className={`btn ${dns === 'adguard' ? 'btn-primary' : ''}`} style={{ flex: '1 1 40%', fontSize: '11px' }} onClick={() => applyDNS('adguard')}>AdGuard</button>
          </div>
        </div>
        
        <button className="btn" style={{ width: '100%', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px dashed rgba(239, 68, 68, 0.3)' }} onClick={runDeepClean}>
          <Trash2 size={18} style={{ marginRight: '8px' }} /> Dọn Rác & Cache Hệ Thống Chuyên Sâu
        </button>

      </div>

      {/* Custom Alert Modal */}
      {modalMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModalMsg('')}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'scale-up 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Thông Báo</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {modalMsg}
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setModalMsg('')}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Debloat Modal */}
      {showDebloatModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '24px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: 'white', marginTop: 0 }}>Tiến Trình 1-Click Debloat</h3>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', margin: '16px 0' }}>
              <div style={{ width: `${debloatProgress}%`, height: '100%', background: 'var(--cyan)', transition: 'width 0.3s' }}></div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-sub)' }}>
              {debloatLog.map((log, idx) => (
                <div key={idx} style={{ color: log.startsWith('✓') || log.startsWith('✨') ? 'var(--green)' : 'inherit', marginBottom: '4px' }}>{log}</div>
              ))}
            </div>
            
            <button className="btn btn-primary" style={{ marginTop: '16px' }} disabled={isDebloating} onClick={() => setShowDebloatModal(false)}>
              {isDebloating ? 'Đang Xử Lý...' : 'Đóng'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
