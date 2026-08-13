import { useState, useEffect } from 'react';
import { useKsu } from '../hooks/useKsu';
import { ShieldAlert } from 'lucide-react';

import GooglePhotosTweak from './tweaks/GooglePhotosTweak';
import AdblockTweak from './tweaks/AdblockTweak';
import DebloatTweak from './tweaks/DebloatTweak';
import PerformanceTweaks from './tweaks/PerformanceTweaks';
import DisplayTweaks from './tweaks/DisplayTweaks';
import NetworkTweaks from './tweaks/NetworkTweaks';
import SecurityTweaks from './tweaks/SecurityTweaks';
import CleanTweak from './tweaks/CleanTweak';

export default function TweaksTab({ isActive }: { isActive: boolean }) {
  const { runShell } = useKsu();
  const [logs, setLogs] = useState<string[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // States
  const [photosEnabled, setPhotosEnabled] = useState(false);
  const [adblockStatus, setAdblockStatus] = useState(false);
  const [adblockDate, setAdblockDate] = useState<string | null>(null);
  const [antiKill, setAntiKill] = useState(false);
  const [gmsDoze, setGmsDoze] = useState(false);
  const [refreshRate, setRefreshRate] = useState<number | 'auto'>(120);
  const [animScale, setAnimScale] = useState(1);
  const [forceFps, setForceFps] = useState(false);
  const [dns, setDns] = useState('default');
  const [bbr, setBbr] = useState(false);
  const [playIntegrity, setPlayIntegrity] = useState(false);
  const [thermal, setThermal] = useState(false);

  const [modalMsg, setModalMsg] = useState('');
  const showAlert = (msg: string) => setModalMsg(msg);
  const logMsg = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

  const getModPath = () => "/data/adb/modules/oneplus_customize";

  const updateBootScript = async (key: string, cmd: string, remove: boolean = false) => {
    const modpath = getModPath();
    const bootFile = `${modpath}/tweaks_boot.sh`;
    if (remove) {
      await runShell(`sed -i '/#${key}/d' ${bootFile}`);
      await runShell(`sed -i '/${cmd.split('/').join('\\\\/')}/d' ${bootFile}`);
    } else {
      await runShell(`mkdir -p ${modpath} && touch ${bootFile}`);
      await runShell(`sed -i '/#${key}/d' ${bootFile}`);
      await runShell(`echo "#${key}" >> ${bootFile} && echo "${cmd}" >> ${bootFile}`);
    }
  };

  useEffect(() => {
    if (isActive && !hasFetched) {
      const fetchStates = async () => {
        // Photos
        const pRes = await runShell(`[ -f "${getModPath()}/system/etc/sysconfig/google_build.xml" ] && echo 1 || echo 0`);
        setPhotosEnabled(pRes.stdout.trim() === '1');

        // Adblock
        const aRes = await runShell(`
          if [ -f "${getModPath()}/system/etc/hosts" ]; then
            date=$(grep -m1 "^# Date:" "${getModPath()}/system/etc/hosts" | sed 's/# Date: //')
            echo "ON|$date"
          else
            echo "OFF|"
          fi
        `);
        const aOut = aRes.stdout.trim().split('|');
        setAdblockStatus(aOut[0] === "ON");
        if (aOut[1]) setAdblockDate(aOut[1].trim());

        // DNS
        const dnsRes = await runShell(`settings get global private_dns_specifier`);
        const d = dnsRes.stdout.trim();
        if (d.includes('cloudflare')) setDns('cloudflare');
        else if (d.includes('google')) setDns('google');
        else if (d.includes('adguard')) setDns('adguard');
        else setDns('default');

        // Refresh Rate
        const rRes = await runShell(`settings get system peak_refresh_rate`);
        const r = parseFloat(rRes.stdout.trim());
        if (!isNaN(r)) setRefreshRate(r);
        else setRefreshRate('auto');

        // Anti Kill
        const akRes = await runShell(`device_config get activity_manager max_phantom_processes`);
        setAntiKill(akRes.stdout.trim() === '8192');

        // Anim
        const anRes = await runShell(`settings get global window_animation_scale`);
        const an = parseFloat(anRes.stdout.trim());
        if (!isNaN(an)) setAnimScale(an);

        // GMS Doze
        const gmsRes = await runShell(`dumpsys deviceidle whitelist | grep com.google.android.gms`);
        setGmsDoze(!gmsRes.stdout.includes('com.google.android.gms'));

        // PIF
        const pifRes = await runShell(`[ -f "${getModPath()}/pif_enabled" ] && echo 1 || echo 0`);
        setPlayIntegrity(pifRes.stdout.trim() === '1');

        // Force FPS
        const fpsRes = await runShell(`settings get system op_custom_vrr_min_refresh_rate`);
        setForceFps(fpsRes.stdout.trim() === '120.0');

        // Thermal
        const thmRes = await runShell(`pm list packages -d | grep com.oplus.battery`);
        setThermal(thmRes.stdout.includes('com.oplus.battery'));

        // BBR
        const bbrRes = await runShell(`sysctl net.ipv4.tcp_congestion_control`);
        setBbr(bbrRes.stdout.includes('bbr'));

        setHasFetched(true);
      };
      fetchStates();
    }
  }, [isActive, hasFetched, runShell]);

  if (!isActive) return null;

  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '20px' }}>
      
      {logs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', color: 'var(--accent-cyan)' }}>
          {logs[0]}
        </div>
      )}

      <div className="list-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        
        <GooglePhotosTweak photosEnabled={photosEnabled} setPhotosEnabled={setPhotosEnabled} showAlert={showAlert} />
        
        <AdblockTweak adblockStatus={adblockStatus} setAdblockStatus={setAdblockStatus} adblockDate={adblockDate} setAdblockDate={setAdblockDate} showAlert={showAlert} logMsg={logMsg} />
        
        <DebloatTweak showAlert={showAlert} logMsg={logMsg} />
        
        <PerformanceTweaks antiKill={antiKill} setAntiKill={setAntiKill} gmsDoze={gmsDoze} setGmsDoze={setGmsDoze} logMsg={logMsg} updateBootScript={updateBootScript} />
        
        <DisplayTweaks refreshRate={refreshRate} setRefreshRate={setRefreshRate} animScale={animScale} setAnimScale={setAnimScale} forceFps={forceFps} setForceFps={setForceFps} logMsg={logMsg} updateBootScript={updateBootScript} />
        
        <NetworkTweaks dns={dns} setDns={setDns} bbr={bbr} setBbr={setBbr} logMsg={logMsg} updateBootScript={updateBootScript} />
        
        <SecurityTweaks playIntegrity={playIntegrity} setPlayIntegrity={setPlayIntegrity} thermal={thermal} setThermal={setThermal} logMsg={logMsg} updateBootScript={updateBootScript} />
        
        <CleanTweak logMsg={logMsg} />

      </div>

      {modalMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModalMsg('')}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'scale-up 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Thông Báo</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {modalMsg}
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setModalMsg('')}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
