import { useState, useEffect, useRef } from 'react';
import { Smartphone, Cpu, HardDrive, ShieldCheck, Battery, BatteryCharging, BatteryFull, Activity } from 'lucide-react';
import { useKsu } from '../hooks/useKsu';

export default function DeviceTab({ isActive }: { isActive: boolean }) {
  const { hasRoot, apiName, runShell } = useKsu();
  const [deviceInfo, setDeviceInfo] = useState({
    brand: 'Đang tải...',
    model: 'Đang tải...',
    cpu: 'Đang tải...',
    gpu: 'Đang tải...',
    cpuPercent: 0,
    gpuPercent: 0,
    ramTotal: 0,
    ramUsed: 0,
    romTotal: 0,
    romUsed: 0,
    battery: 0,
    isCharging: false,
    batteryHealth: 'Good',
    modules: [] as string[]
  });

  const prevCpuStat = useRef({ total: 0, idle: 0 });

  const formatBytes = (kb: number) => {
    if (kb === 0) return '0 GB';
    const gb = kb / 1024 / 1024;
    return gb.toFixed(1) + ' GB';
  };

  const fetchDeviceInfo = async () => {
    if (!hasRoot) return;

    try {
      const [
        brandRes, modelRes, memRes, hwRes, envRes, hwStatRes, romRes, batRes
      ] = await Promise.all([
        runShell('getprop ro.product.brand', 2000),
        runShell('getprop ro.product.model', 2000),
        runShell(`
          t=$(cat /proc/meminfo 2>/dev/null | grep -i '^MemTotal' | grep -o '[0-9]*' | head -n 1)
          a=$(cat /proc/meminfo 2>/dev/null | grep -i '^MemAvailable' | grep -o '[0-9]*' | head -n 1)
          echo "$t|$a"
        `, 3000),
        runShell(`
          cpu=$(getprop ro.board.platform 2>/dev/null)
          if [ -z "$cpu" ]; then cpu=$(getprop ro.hardware 2>/dev/null); fi
          gpu=$(cat /sys/class/kgsl/kgsl-3d0/gpu_model 2>/dev/null)
          if [ -z "$gpu" ]; then gpu=$(dumpsys SurfaceFlinger 2>/dev/null | grep -i 'GLES: ' | head -n 1 | cut -d',' -f2 | xargs); fi
          echo "$cpu|$gpu"
        `, 2000),
        runShell(`
          z=""; m="";
          # Kiểm tra trạng thái thực tế (Real Status) bằng cách soi memory map của tiến trình Zygote
          for pid in $(pidof zygote64 2>/dev/null) $(pidof zygote 2>/dev/null); do
            if grep -qi 'zygisk' /proc/$pid/maps 2>/dev/null; then z="Zygisk"; fi
            if grep -qi 'shamiko' /proc/$pid/maps 2>/dev/null; then m="Shamiko"; fi
            if grep -qiE 'meta|^Tricky' /proc/$pid/maps 2>/dev/null; then m="Meta"; fi
          done
          echo "$z|$m"
        `, 2000),
        runShell(`
          c=$(cat /proc/stat 2>/dev/null | grep -w cpu | head -n 1)
          g=$(cat /sys/class/kgsl/kgsl-3d0/gpu_busy_percentage 2>/dev/null | grep -o '[0-9]*' | head -n 1)
          if [ -z "$g" ]; then g=$(cat /sys/class/kgsl/kgsl-3d0/devfreq/gpu_load 2>/dev/null | grep -o '[0-9]*' | head -n 1); fi
          echo "$c|$g"
        `, 2000),
        runShell(`df /data 2>/dev/null | tail -n 1`, 3000),
        runShell(`
          l=$(cat /sys/class/power_supply/battery/capacity 2>/dev/null)
          if [ -z "$l" ]; then l=$(dumpsys battery 2>/dev/null | grep -m 1 'level: ' | cut -d ':' -f2 | tr -d ' '); fi
          ht=$(cat /sys/class/power_supply/battery/health 2>/dev/null)
          if [ -z "$ht" ]; then ht=$(dumpsys battery 2>/dev/null | grep -m 1 'health: ' | cut -d ':' -f2 | tr -d ' '); fi
          st=$(cat /sys/class/power_supply/battery/status 2>/dev/null)
          if [ -z "$st" ]; then st=$(dumpsys battery 2>/dev/null | grep -m 1 'status: ' | cut -d ':' -f2 | tr -d ' '); fi
          echo "$l|$ht|$st"
        `, 3000)
      ]);

      let memTotal = 0, memAvailable = 0;
      if (memRes.stdout) {
        const parts = memRes.stdout.trim().split('|');
        memTotal = parseInt(parts[0], 10) || 0;
        memAvailable = parseInt(parts[1], 10) || 0;
      }

      let romTotal = 0, romUsed = 0;
      if (romRes.stdout) {
        const parts = romRes.stdout.trim().split(/\s+/);
        if (parts.length >= 4) {
          if (parts[1].match(/^[0-9]+$/)) {
            romTotal = parseInt(parts[1], 10);
            romUsed = parseInt(parts[2], 10);
          } else if (parts.length >= 5 && parts[2].match(/^[0-9]+$/)) {
            romTotal = parseInt(parts[2], 10);
            romUsed = parseInt(parts[3], 10);
          }
        }
      }
      
      let batteryLevel = 0, status = 1, healthCode = 1;
      let isCharging = false;
      if (batRes.stdout) {
        const bParts = batRes.stdout.trim().split('|');
        batteryLevel = parseInt(bParts[0], 10) || 0;
        
        let hs = bParts[1] ? bParts[1].toLowerCase().trim() : "";
        if (hs === 'good' || hs === '2') healthCode = 2;
        else if (hs === 'overheat' || hs === '3') healthCode = 3;
        else if (hs === 'dead' || hs === '4') healthCode = 4;
        else if (hs === 'over_voltage' || hs === '5') healthCode = 5;
        else if (hs === 'cold' || hs === '7') healthCode = 7;
        else healthCode = parseInt(hs, 10) || 1;
        
        let ss = bParts[2] ? bParts[2].toLowerCase().trim() : "";
        if (ss.includes('charging') && !ss.includes('discharging')) {
           isCharging = true;
           status = 2;
        } else {
           status = parseInt(ss, 10) || 1;
           isCharging = (status === 2 || status === 5);
        }
      }
      let healthText = 'Bình thường';
      if (healthCode === 2) healthText = 'Tốt';
      else if (healthCode === 3) healthText = 'Quá nhiệt';
      else if (healthCode === 4) healthText = 'Chai pin (Chết)';
      else if (healthCode === 5) healthText = 'Quá áp';
      else if (healthCode === 7) healthText = 'Đang lạnh';

      // Parse Hardware Identity
      let cpuName = 'Unknown', gpuName = 'Unknown';
      if (hwRes.stdout) {
        const parts = hwRes.stdout.trim().split('|');
        if (parts[0]) cpuName = parts[0].trim().toUpperCase();
        if (parts[1]) gpuName = parts[1].trim();
      }

      // Parse Modules
      const activeModules: string[] = [];
      if (envRes.stdout) {
        const mParts = envRes.stdout.trim().split('|');
        if (mParts[0]) activeModules.push(mParts[0].trim());
        if (mParts[1]) activeModules.push(mParts[1].trim());
      }

      // Parse Hardware Usage
      let currentCpuPercent = 0, currentGpuPercent = 0;
      setDeviceInfo(prev => {
        currentCpuPercent = prev.cpuPercent;
        currentGpuPercent = prev.gpuPercent;
        return prev;
      });

      if (hwStatRes.stdout) {
        const hParts = hwStatRes.stdout.trim().split('|');
        if (hParts[0] && hParts[0].startsWith('cpu')) {
          const vals = hParts[0].trim().split(/\s+/).slice(1).map(Number);
          if (vals.length >= 4) {
            const user = vals[0] || 0;
            const nice = vals[1] || 0;
            const system = vals[2] || 0;
            const idle = vals[3] || 0;
            const iowait = vals[4] || 0;
            const irq = vals[5] || 0;
            const softirq = vals[6] || 0;
            const steal = vals[7] || 0;
            const total = user + nice + system + idle + iowait + irq + softirq + steal;
            const totalIdle = idle + iowait;
            const prevTotal = prevCpuStat.current.total;
            const prevIdle = prevCpuStat.current.idle;
            if (prevTotal > 0) {
              const diffTotal = total - prevTotal;
              const diffIdle = totalIdle - prevIdle;
              if (diffTotal > 0) {
                currentCpuPercent = Math.round((1 - (diffIdle / diffTotal)) * 100);
                if (currentCpuPercent < 0) currentCpuPercent = 0;
                if (currentCpuPercent > 100) currentCpuPercent = 100;
              }
            }
            prevCpuStat.current = { total, idle: totalIdle };
          }
        }
        if (hParts[1]) {
          currentGpuPercent = parseInt(hParts[1], 10) || 0;
        }
      }

      setDeviceInfo({
        brand: brandRes.stdout.trim() || 'Unknown',
        model: modelRes.stdout.trim() || 'Unknown',
        cpu: cpuName,
        gpu: gpuName,
        cpuPercent: currentCpuPercent,
        gpuPercent: currentGpuPercent,
        ramTotal: memTotal,
        ramUsed: memTotal - memAvailable,
        romTotal: romTotal,
        romUsed: romUsed,
        battery: batteryLevel,
        isCharging,
        batteryHealth: healthText,
        modules: activeModules
      });
    } catch (e) {
      console.error("Failed to fetch device info", e);
    }
  };

  useEffect(() => {
    if (hasRoot && isActive) {
      fetchDeviceInfo();
      const interval = setInterval(fetchDeviceInfo, 5000); // Cập nhật mỗi 5s
      return () => clearInterval(interval);
    }
  }, [hasRoot, isActive]);

  const ramPercent = deviceInfo.ramTotal ? (deviceInfo.ramUsed / deviceInfo.ramTotal) * 100 : 0;
  const romPercent = deviceInfo.romTotal ? (deviceInfo.romUsed / deviceInfo.romTotal) * 100 : 0;

  return (
    <div className="glass-card" style={{ animationDelay: '0.1s' }}>
      <div className="card-title">
        <Smartphone className="text-cyan" size={20} />
        <span>Thông tin thiết bị</span>
      </div>

      <div className="device-identity" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
          <Smartphone size={32} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{deviceInfo.brand}</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>{deviceInfo.model}</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-sub)' }}>
              <Cpu size={12} className="text-cyan" />
              <span style={{ color: 'white', fontWeight: 600 }}>{deviceInfo.cpu}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-sub)' }}>
              <Activity size={12} className="text-yellow" />
              <span style={{ color: 'white', fontWeight: 600 }}>{deviceInfo.gpu}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="info-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="info-label">Hoạt động CPU</span>
            <Cpu size={16} className="text-cyan" />
          </div>
          <div className="info-value">{deviceInfo.cpuPercent}%</div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${deviceInfo.cpuPercent}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }}></div>
          </div>
        </div>

        <div className="info-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="info-label">Hoạt động GPU</span>
            <Activity size={16} className="text-yellow" />
          </div>
          <div className="info-value">{deviceInfo.gpuPercent}%</div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${deviceInfo.gpuPercent}%`, background: 'linear-gradient(90deg, #fcd34d, #f59e0b)' }}></div>
          </div>
        </div>

        <div className="info-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="info-label">Bộ nhớ RAM</span>
            <Cpu size={16} className="text-cyan" />
          </div>
          <div className="info-value">{formatBytes(deviceInfo.ramUsed)} <span style={{fontSize: '11px', color: 'var(--text-sub)'}}>/ {formatBytes(deviceInfo.ramTotal)}</span></div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${ramPercent}%` }}></div>
          </div>
        </div>

        <div className="info-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="info-label">Lưu trữ /data</span>
            <HardDrive size={16} className="text-yellow" />
          </div>
          <div className="info-value">{formatBytes(deviceInfo.romUsed)} <span style={{fontSize: '11px', color: 'var(--text-sub)'}}>/ {formatBytes(deviceInfo.romTotal)}</span></div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${romPercent}%`, background: 'linear-gradient(90deg, var(--accent-yellow), #d97706)' }}></div>
          </div>
        </div>
      </div>

      {/* Battery Section Separated */}
      <div className="info-box" style={{ marginTop: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="info-label" style={{ fontSize: '12px' }}>Trạng thái Pin</span>
          {deviceInfo.isCharging ? (
            <BatteryCharging size={20} className="text-green" style={{ animation: 'pulse-glow 2s infinite', borderRadius: '50%' }} />
          ) : deviceInfo.battery > 80 ? (
            <BatteryFull size={20} className="text-green" />
          ) : (
            <Battery size={20} className="text-cyan" />
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: deviceInfo.isCharging ? 'var(--accent-green)' : 'white', lineHeight: 1 }}>
            {deviceInfo.battery}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} className="text-yellow" /> 
            Sức khỏe: <span style={{ color: 'white', fontWeight: 600 }}>{deviceInfo.batteryHealth}</span>
          </div>
        </div>
        
        {/* Charging Animation Bar */}
        <div className="progress-bg" style={{ height: '12px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
          <div 
            className="progress-fill" 
            style={{ 
              width: `${deviceInfo.battery}%`, 
              background: deviceInfo.isCharging ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, var(--accent-cyan), #0ea5e9)',
              transition: 'width 1s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {deviceInfo.isCharging && (
              <div style={{ 
                position: 'absolute', top: 0, left: '-100%', bottom: 0, width: '50%', 
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 1.5s infinite' 
              }}></div>
            )}
          </div>
        </div>
      </div>

      <div className="info-box" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="info-label">Trạng thái Root</span>
          <ShieldCheck size={18} className={hasRoot ? "text-green" : "text-red"} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span className="info-value text-cyan" dangerouslySetInnerHTML={{ __html: apiName || 'Unknown' }}></span>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            {deviceInfo.modules && deviceInfo.modules.map((mod, idx) => (
              <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>
                {mod}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
