import { useState, useEffect } from 'react';
import { useKsu } from './useKsu';

export function useTweaks(isActive: boolean) {
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

  return {
    logs,
    modalMsg, setModalMsg,
    showAlert, logMsg, updateBootScript,
    photosEnabled, setPhotosEnabled,
    adblockStatus, setAdblockStatus,
    adblockDate, setAdblockDate,
    antiKill, setAntiKill,
    gmsDoze, setGmsDoze,
    refreshRate, setRefreshRate,
    animScale, setAnimScale,
    forceFps, setForceFps,
    dns, setDns,
    bbr, setBbr,
    playIntegrity, setPlayIntegrity,
    thermal, setThermal
  };
}
