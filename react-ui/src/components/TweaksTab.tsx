import { Settings2, Image, ShieldAlert, Monitor, Activity, Trash2, Globe, Sparkles, ShieldCheck, Flame, Zap, Wifi, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useKsu } from '../hooks/useKsu';

export default function TweaksTab({ isActive }: { isActive: boolean }) {
  const { hasRoot, runShell } = useKsu();
  const [logs, setLogs] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // States for toggles/buttons
  const [adblockStatus, setAdblockStatus] = useState(false);
  const [adblockDate, setAdblockDate] = useState<string | null>(null);
  const [gmsDoze, setGmsDoze] = useState(false);
  const [dns, setDns] = useState('default');
  const [refreshRate, setRefreshRate] = useState(120);
  const [antiKill, setAntiKill] = useState(false);
  const [animScale, setAnimScale] = useState(1);
  const [photosEnabled, setPhotosEnabled] = useState(false);
  const [playIntegrity, setPlayIntegrity] = useState(false);
  const [forceFps, setForceFps] = useState(false);
  const [thermal, setThermal] = useState(false);
  const [bbr, setBbr] = useState(false);

  // Modal Debloat
  const [showDebloatModal, setShowDebloatModal] = useState(false);

  type DebloatApp = {
    pkg: string;
    name: string;
    desc: string;
    risk: 'Low' | 'Medium' | 'High';
    available?: boolean;
    disabled?: boolean;
  };

  const DEBLOAT_LIST: DebloatApp[] = [
    // Oppo / ColorOS
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
    // OnePlus Specific
    { pkg: "com.oneplus.mall", name: "OnePlus Store", desc: "Cửa hàng mua sắm", risk: "Low" },
    { pkg: "com.oneplus.account", name: "OnePlus Account", desc: "Tài khoản OnePlus", risk: "Medium" },
    { pkg: "com.oneplus.gamespace", name: "OP Game Space", desc: "Không gian trò chơi OP", risk: "Low" },
    { pkg: "com.oneplus.tvremote", name: "TV Remote", desc: "Điều khiển TV", risk: "Low" },
    // Third Party
    { pkg: "com.facebook.appmanager", name: "FB App Manager", desc: "Quản lý ứng dụng Facebook", risk: "Low" },
    { pkg: "com.facebook.services", name: "FB Services", desc: "Dịch vụ nền Facebook", risk: "Low" },
    { pkg: "com.facebook.system", name: "FB System", desc: "Hệ thống Facebook", risk: "Low" },
    { pkg: "com.netflix.partner.activation", name: "Netflix Activation", desc: "Dịch vụ đối tác Netflix", risk: "Low" }
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
  const [confirmModal, setConfirmModal] = useState<{ msg: string, onConfirm: () => void } | null>(null);

  const promptEnablePhotos = () => {
    if (photosEnabled) return;
    setConfirmModal({
      msg: "Tính năng này sẽ xóa dữ liệu của ứng dụng Google Photos để áp dụng bản patch (không làm mất ảnh trên Cloud của bạn). Bạn có muốn tiếp tục?",
      onConfirm: enablePhotos
    });
  };

  const enablePhotos = async () => {
    logMsg("Đang kích hoạt Google Photos...");
    const modpath = getModPath();
    await runShell(`sh ${modpath}/enable_photos.sh ${modpath}`);
    setPhotosEnabled(true);
    showAlert("Kích hoạt Google Photos thành công! Vui lòng khởi động lại máy.");
  };

  // 2. AdBlock
  const checkAdblock = async () => {
    const res = await runShell(`
      if [ -f "${getModPath()}/system/etc/hosts" ]; then
        date=$(grep -m1 "^# Date:" "${getModPath()}/system/etc/hosts" | sed 's/# Date: //')
        echo "ON|$date"
      else
        echo "OFF|"
      fi
    `);
    const out = res.stdout.trim().split('|');
    setAdblockStatus(out[0] === "ON");
    if (out[1]) setAdblockDate(out[1].trim());
  };

  const toggleAdblock = async () => {
    if (adblockStatus) {
      logMsg("Đang tắt Ad-Blocker...");
      await runShell(`rm -f ${getModPath()}/system/etc/hosts`);
      setAdblockStatus(false);
      setAdblockDate(null);
      showAlert("Đã tắt Ad-Blocker. Vui lòng khởi động lại thiết bị.");
    } else {
      logMsg("Đang tải dữ liệu Ad-Blocker (Có thể mất 10-30s)...");
      
      const script = `
        TMP_FILE="/data/local/tmp/hosts_tmp"
        rm -f $TMP_FILE
        
        if command -v curl >/dev/null 2>&1; then
          curl -s -o $TMP_FILE "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
        elif [ -f "/data/adb/ksu/bin/busybox" ]; then
          /data/adb/ksu/bin/busybox wget -q -O $TMP_FILE "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
        elif [ -f "/data/adb/ap/bin/busybox" ]; then
          /data/adb/ap/bin/busybox wget -q -O $TMP_FILE "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
        elif command -v wget >/dev/null 2>&1; then
          wget -q -O $TMP_FILE "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
        else
          echo "ERROR: Không tìm thấy công cụ tải (curl/wget). ROM không hỗ trợ."
          exit 1
        fi
        
        if [ ! -s $TMP_FILE ]; then
          echo "ERROR: Tải thất bại hoặc kết nối bị ngắt quãng (File rỗng)."
          exit 1
        fi
        
        if ! head -n 20 $TMP_FILE | grep -q "StevenBlack"; then
          echo "ERROR: File tải về bị lỗi định dạng (Có thể do mạng wifi yêu cầu đăng nhập portal)."
          exit 1
        fi
        
        mkdir -p ${getModPath()}/system/etc
        mv $TMP_FILE ${getModPath()}/system/etc/hosts
        chmod 644 ${getModPath()}/system/etc/hosts
        echo "SUCCESS"
      `;
      
      const res = await runShell(script);
      
      if (res.stdout.includes("SUCCESS")) {
         await checkAdblock();
         showAlert("Tải file hosts thành công! Vui lòng khởi động lại máy để áp dụng.");
      } else {
         const err = res.stdout.split('\\n').find(l => l.includes("ERROR:"));
         showAlert(err || "Lỗi không xác định khi tải AdBlock.");
      }
    }
  };

  // 3. Debloat
  const [debloatApps, setDebloatApps] = useState<DebloatApp[]>([]);
  const [isScanningDebloat, setIsScanningDebloat] = useState(false);

  const openDebloatManager = async () => {
    setShowDebloatModal(true);
    setIsScanningDebloat(true);
    setDebloatApps([]);
    
    try {
      // Dùng pm list packages -d để lấy danh sách app đã bị disable (danh sách này thường ngắn, không bị kẹt buffer)
      const disRes = await runShell("pm list packages -d -u --user 0 2>/dev/null");
      const disabledPkgs = disRes.stdout.split('\n').filter(l => l.includes('package:')).map(l => l.replace('package:', '').trim());

      let allPkgs: string[] = [];
      const ksu = (window as any).ksu;
      
      // Ưu tiên dùng KSU Native API (giống FreezeTab) để lấy toàn bộ danh sách cực nhanh và không bao giờ bị cắt chuỗi
      if (ksu && typeof ksu.listPackages === 'function') {
         try {
            const pkgs = JSON.parse(ksu.listPackages("all"));
            if (pkgs && pkgs.length > 0) allPkgs = pkgs;
         } catch(e) {}
      }

      // Fallback nếu KSU API không hỗ trợ
      if (allPkgs.length === 0) {
         const allRes = await runShell("pm list packages -u 2>/dev/null");
         allPkgs = allRes.stdout.split('\n').filter(l => l.includes('package:')).map(l => l.replace('package:', '').trim());
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

  // 9. Dọn Log & Cache
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanLog, setCleanLog] = useState<string[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanOptions, setCleanOptions] = useState({
    caches: true,
    tmp: false,
    tombstones: false,
    logs: false
  });

  const runCleanAction = async () => {
    setIsCleaning(true);
    setCleanLog(["Đang khởi tạo công cụ dọn dẹp..."]);
    setCleanProgress(10);
    await new Promise(r => setTimeout(r, 500));

    let progress = 10;
    const increment = 90 / (Object.values(cleanOptions).filter(v => v).length || 1);

    if (cleanOptions.caches) {
      setCleanLog(prev => [...prev, "Đang dọn dẹp bộ nhớ đệm (App Caches)..."]);
      await runShell(`pm trim-caches 9999999999999`);
      progress += increment;
      setCleanProgress(progress);
      await new Promise(r => setTimeout(r, 500));
    }

    if (cleanOptions.tmp) {
      setCleanLog(prev => [...prev, "Đang dọn dẹp thư mục tạm (/data/local/tmp)..."]);
      await runShell(`rm -rf /data/local/tmp/*`);
      progress += increment;
      setCleanProgress(progress);
      await new Promise(r => setTimeout(r, 500));
    }

    if (cleanOptions.tombstones) {
      setCleanLog(prev => [...prev, "Đang xóa dữ liệu chẩn đoán (Crash/ANR/Tombstones)..."]);
      await runShell(`rm -rf /data/tombstones/*; rm -rf /data/anr/*`);
      progress += increment;
      setCleanProgress(progress);
      await new Promise(r => setTimeout(r, 500));
    }

    if (cleanOptions.logs) {
      setCleanLog(prev => [...prev, "Đang quét nhật ký hệ thống (/data/log)..."]);
      await runShell(`rm -rf /data/log/*`);
      progress += increment;
      setCleanProgress(progress);
      await new Promise(r => setTimeout(r, 500));
    }

    setCleanProgress(100);
    setCleanLog(prev => [...prev, "✨ Hoàn tất dọn dẹp!"]);
    setIsCleaning(false);
    logMsg("Dọn dẹp hệ thống thành công!");
  };

  // 11. New Tweaks (Play Integrity, FPS, Thermal, BBR)
  const applyPlayIntegrity = async (enable: boolean) => {
    setPlayIntegrity(enable);
    const modpath = getModPath();
    if (enable) {
      await runShell(`touch ${modpath}/pif_enabled`);
      logMsg("Đã bật Play Integrity Fix (Cần khởi động lại).");
    } else {
      await runShell(`rm -f ${modpath}/pif_enabled`);
      logMsg("Đã tắt Play Integrity Fix.");
    }
  };

  const applyForceFps = async (enable: boolean) => {
    setForceFps(enable);
    if (enable) {
      const cmd = `settings put system peak_refresh_rate 120.0; settings put system min_refresh_rate 120.0; settings put secure min_refresh_rate 120.0; settings put system op_custom_vrr_min_refresh_rate 120.0`;
      await runShell(cmd);
      await updateBootScript('FORCE_FPS', cmd, false);
      logMsg("Đã ép tần số quét 120Hz/144Hz tối đa!");
    } else {
      await updateBootScript('FORCE_FPS', '', true);
      logMsg("Khôi phục tần số quét mặc định.");
    }
  };

  const applyThermal = async (enable: boolean) => {
    setThermal(enable);
    if (enable) {
      const cmd = `pm disable-user --user 0 com.oplus.battery; pm disable-user --user 0 com.oplus.athena; stop thermal-engine`;
      await runShell(cmd);
      await updateBootScript('DISABLE_THERMAL', cmd, false);
      logMsg("Đã gỡ bỏ giới hạn nhiệt độ (Hiệu năng tối đa)!");
    } else {
      const cmd = `pm enable com.oplus.battery; pm enable com.oplus.athena; start thermal-engine`;
      await runShell(cmd);
      await updateBootScript('DISABLE_THERMAL', '', true);
      logMsg("Khôi phục quản lý nhiệt độ.");
    }
  };

  const applyBbr = async (enable: boolean) => {
    setBbr(enable);
    if (enable) {
      const cmd = `sysctl -w net.ipv4.tcp_congestion_control=bbr`;
      await runShell(cmd);
      await updateBootScript('TCP_BBR', cmd, false);
      logMsg("Đã bật thuật toán TCP BBR tăng tốc mạng!");
    } else {
      const cmd = `sysctl -w net.ipv4.tcp_congestion_control=cubic`;
      await runShell(cmd);
      await updateBootScript('TCP_BBR', '', true);
      logMsg("Đã tắt TCP BBR.");
    }
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
        if ([60, 90, 120].includes(rate)) setRefreshRate(rate);
      });
      runShell("settings get global animator_duration_scale").then(res => {
        const val = parseFloat(res.stdout);
        if (!isNaN(val)) setAnimScale(val);
      });
      runShell(`[ -f "${getModPath()}/pif_enabled" ] && echo "ON" || echo "OFF"`).then(res => {
        if (res.stdout.trim() === "ON") setPlayIntegrity(true);
      });
      runShell(`grep "FORCE_FPS" ${getModPath()}/tweaks_boot.sh`).then(res => {
        if (res.stdout.trim() !== "") setForceFps(true);
      });
      runShell(`grep "DISABLE_THERMAL" ${getModPath()}/tweaks_boot.sh`).then(res => {
        if (res.stdout.trim() !== "") setThermal(true);
      });
      runShell(`grep "TCP_BBR" ${getModPath()}/tweaks_boot.sh`).then(res => {
        if (res.stdout.trim() !== "") setBbr(true);
      });
      setHasFetched(true);
    }
  }, [hasRoot, isActive]);



  useEffect(() => {
    const el = document.getElementById('clean-log');
    if (el) el.scrollTop = el.scrollHeight;
  }, [cleanLog]);

  return (
    <div className="glass-card" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '16px' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>
        <Settings2 className="text-cyan" size={20} />
        <span>Tiện Ích Mở Rộng & Tối Ưu</span>
      </div>

      {logs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', color: 'var(--accent-cyan)' }}>
          {logs[0]}
        </div>
      )}

      <div className="list-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        {/* Google Photos */}
        <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-yellow)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Image size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Google Photos Unlimited</span>
              <span className="item-desc">Sao lưu ảnh không giới hạn</span>
            </div>
          </div>
          <button className={`btn ${photosEnabled ? 'btn-cancel' : 'btn-primary'}`} style={{ width: '100%' }} onClick={promptEnablePhotos}>
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
              <span className="item-desc">Chặn quảng cáo qua Hosts <br />
                {adblockStatus && <span className="text-green" style={{ fontSize: '10px' }}>
                  (Bật) {adblockDate ? `Cập nhật: ${adblockDate}` : ''}
                </span>}
              </span>
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
              <span className="item-title">Quản Lý Bloatware</span>
              <span className="item-desc">Vô hiệu hóa an toàn ứng dụng rác</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={openDebloatManager}>Quản Lý Debloat</button>
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
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>Chống văng App (Anti-Kill)</span>
                <div className={`switch ${antiKill ? 'active' : ''}`} onClick={() => applyAntiKill(!antiKill)}>
                  <div className="switch-handle"></div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Có thể tăng RAM usage</span>
                <span style={{ color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Có thể tăng battery usage</span>
                <span style={{ color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.3 }}><AlertTriangle size={12} style={{ minWidth: '12px' }} /> Làm thay đổi behavior quản lý tiến trình mặc định</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>Tiết kiệm Pin GMS (Doze)</span>
              <div className={`switch ${gmsDoze ? 'active' : ''}`} onClick={() => applyGmsDoze(!gmsDoze)}>
                <div className="switch-handle"></div>
              </div>
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

        {/* Property Spoofing */}
        <div className="list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)' }}>
              <ShieldCheck size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Boot/Build Property Spoof</span>
              <span className="item-desc">Đổi thuộc tính cơ bản (Basic Hide)</span>
            </div>
          </div>
          <div className={`switch ${playIntegrity ? 'active' : ''}`} onClick={() => applyPlayIntegrity(!playIntegrity)}>
            <div className="switch-handle"></div>
          </div>
        </div>

        {/* Unlock FPS */}
        <div className="list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}>
              <Zap size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Ép Xung Màn Hình (Game)</span>
              <span className="item-desc">Khóa cứng 120/144Hz tối đa</span>
            </div>
          </div>
          <div className={`switch ${forceFps ? 'active' : ''}`} onClick={() => applyForceFps(!forceFps)}>
            <div className="switch-handle"></div>
          </div>
        </div>

        {/* Disable Thermal Throttling */}
        <div className="list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <Flame size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Hiệu Năng Tối Đa</span>
              <span className="item-desc">Gỡ bỏ giới hạn nhiệt độ (Gây nóng máy)</span>
            </div>
          </div>
          <div className={`switch ${thermal ? 'active' : ''}`} onClick={() => applyThermal(!thermal)}>
            <div className="switch-handle"></div>
          </div>
        </div>

        {/* TCP BBR */}
        <div className="list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="item-icon" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
              <Wifi size={20} />
            </div>
            <div className="item-info">
              <span className="item-title">Tăng Tốc Mạng (TCP BBR)</span>
              <span className="item-desc">Giảm Ping, tăng tốc độ mạng</span>
            </div>
          </div>
          <div className={`switch ${bbr ? 'active' : ''}`} onClick={() => applyBbr(!bbr)}>
            <div className="switch-handle"></div>
          </div>
        </div>

        <button
          className="btn"
          style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(45deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
            border: '1px dashed rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            color: 'var(--accent-cyan)',
            marginTop: '12px',
            transition: 'all 0.3s'
          }}
          onClick={() => setShowCleanModal(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px' }}>
            <Sparkles size={18} /> Dọn Log & Cache
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 'normal' }}>Giải phóng không gian lưu trữ tùy chọn</span>
        </button>

      </div>

      {/* Custom Alert Modal */}
      {
        modalMsg && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModalMsg('')}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'scale-up 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
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
        )
      }

      {/* Confirm Modal */}
      {
        confirmModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'scale-up 0.2s ease-out' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <ShieldAlert size={24} />
              </div>
              <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Cảnh Báo</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                {confirmModal.msg}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setConfirmModal(null)}>
                  Hủy
                </button>
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--accent-red)', borderColor: 'var(--accent-red)', color: 'white' }} onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}>
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Debloat Modal */}
      {
        showDebloatModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '450px', height: '500px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Quản Lý Debloat</h3>
                <button className="btn" style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }} onClick={disableAllLowRisk} disabled={isScanningDebloat}>
                  Disable All (Low Risk)
                </button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px' }}>
                {isScanningDebloat ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-sub)' }}>
                    Đang quét ứng dụng...
                  </div>
                ) : debloatApps.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-sub)' }}>
                    Không tìm thấy ứng dụng rác nào.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {debloatApps.map((app) => (
                      <div key={app.pkg} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '12px' }}>
                          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{app.name}</span>
                          <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>{app.desc}</span>
                          <span style={{ fontSize: '10px', marginTop: '4px', color: app.risk === 'Low' ? 'var(--accent-green)' : app.risk === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                            Rủi ro: {app.risk}
                          </span>
                        </div>
                        <div className={`switch ${!app.disabled ? 'active' : ''}`} onClick={() => toggleDebloatApp(app.pkg, !app.disabled)}>
                          <div className="switch-handle"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowDebloatModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        )
      }

      {/* Interactive Log & Cache Modal */}
      {
        showCleanModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '450px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: 'white', marginTop: 0, marginBottom: '16px' }}>Dọn Log & Cache</h3>
              
              {!isCleaning && cleanProgress === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={cleanOptions.caches} onChange={e => setCleanOptions(p => ({ ...p, caches: e.target.checked }))} style={{ accentColor: 'var(--accent-cyan)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>Dọn Bộ Nhớ Đệm (Caches)</span>
                      <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>An toàn, giải phóng nhiều dung lượng.</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={cleanOptions.tmp} onChange={e => setCleanOptions(p => ({ ...p, tmp: e.target.checked }))} style={{ accentColor: 'var(--accent-cyan)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>Xóa Tệp Tạm Hệ Thống (Tmp)</span>
                      <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Dọn dẹp tệp dư thừa từ các tác vụ adb/ngầm.</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <input type="checkbox" checked={cleanOptions.tombstones} onChange={e => setCleanOptions(p => ({ ...p, tombstones: e.target.checked }))} style={{ accentColor: 'var(--accent-red)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--accent-red)', fontSize: '13px', fontWeight: 'bold' }}>Dọn Dữ Liệu Chẩn Đoán (Crash/ANR)</span>
                      <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>⚠️ Khuyên dùng: Giữ lại để truy vết lỗi khi có sự cố.</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <input type="checkbox" checked={cleanOptions.logs} onChange={e => setCleanOptions(p => ({ ...p, logs: e.target.checked }))} style={{ accentColor: 'var(--accent-red)', width: '18px', height: '18px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--accent-red)', fontSize: '13px', fontWeight: 'bold' }}>Dọn Nhật Ký Hệ Thống (Logs)</span>
                      <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>⚠️ Xóa bỏ log ghi chú của hệ điều hành.</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', margin: '16px 0' }}>
                    <div style={{ width: `${cleanProgress}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.3s' }}></div>
                  </div>
                  <div id="clean-log" style={{ height: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-sub)' }}>
                    {cleanLog.map((log, idx) => (
                      <div key={idx} style={{ color: log.includes('✨') ? 'var(--accent-green)' : 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>{log}</div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {!isCleaning && cleanProgress === 0 ? (
                  <>
                    <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowCleanModal(false)}>Hủy</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={runCleanAction} disabled={!cleanOptions.caches && !cleanOptions.tmp && !cleanOptions.tombstones && !cleanOptions.logs}>Thực Hiện Dọn</button>
                  </>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} disabled={isCleaning} onClick={() => { setShowCleanModal(false); setCleanProgress(0); setCleanLog([]); }}>
                    {isCleaning ? 'Đang Xử Lý...' : 'Hoàn Tất'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
