import { ShieldCheck, Flame } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function SecurityTweaks({ 
  playIntegrity, 
  setPlayIntegrity, 
  thermal, 
  setThermal, 
  logMsg, 
  updateBootScript 
}: { 
  playIntegrity: boolean, 
  setPlayIntegrity: (v: boolean) => void, 
  thermal: boolean, 
  setThermal: (v: boolean) => void, 
  logMsg: (msg: string) => void,
  updateBootScript: (k: string, c: string, r: boolean) => Promise<void>
}) {
  const { runShell } = useKsu();
  const getModPath = () => "/data/adb/modules/oneplus_customize";

  const applyPlayIntegrity = async (enable: boolean) => {
    setPlayIntegrity(enable);
    const modpath = getModPath();
    if (enable) {
      await runShell(`touch ${modpath}/pif_enabled`);
      logMsg("Đã bật Boot/Build Property Spoof (Cần khởi động lại).");
    } else {
      await runShell(`rm -f ${modpath}/pif_enabled`);
      logMsg("Đã tắt Property Spoof.");
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

  return (
    <>
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
    </>
  );
}
