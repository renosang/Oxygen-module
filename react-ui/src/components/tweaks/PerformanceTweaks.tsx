import { Activity, AlertTriangle } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function PerformanceTweaks({ 
  antiKill, 
  setAntiKill, 
  gmsDoze, 
  setGmsDoze, 
  logMsg, 
  updateBootScript 
}: { 
  antiKill: boolean, 
  setAntiKill: (v: boolean) => void, 
  gmsDoze: boolean, 
  setGmsDoze: (v: boolean) => void, 
  logMsg: (msg: string) => void,
  updateBootScript: (k: string, c: string, r: boolean) => Promise<void>
}) {
  const { runShell } = useKsu();

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

  return (
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
  );
}
