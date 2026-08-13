import { Monitor, Sparkles, Zap } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function DisplayTweaks({ 
  refreshRate, 
  setRefreshRate, 
  animScale, 
  setAnimScale, 
  forceFps, 
  setForceFps,
  logMsg, 
  updateBootScript 
}: { 
  refreshRate: number | 'auto', 
  setRefreshRate: (v: number | 'auto') => void, 
  animScale: number, 
  setAnimScale: (v: number) => void, 
  forceFps: boolean, 
  setForceFps: (v: boolean) => void,
  logMsg: (msg: string) => void,
  updateBootScript: (k: string, c: string, r: boolean) => Promise<void>
}) {
  const { runShell } = useKsu();

  const applyRefreshRate = async (rate: number | 'auto') => {
    setRefreshRate(rate);
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

  const applyAnim = async (scale: number) => {
    setAnimScale(scale);
    const cmd = `settings put global window_animation_scale ${scale}; settings put global transition_animation_scale ${scale}; settings put global animator_duration_scale ${scale}`;
    await runShell(cmd);
    await updateBootScript('ANIMATION_SCALE', cmd, false);
    logMsg(`Đã chỉnh tốc độ hiệu ứng về ${scale}x`);
  };

  const applyDPI = async (dpi: string) => {
    if (dpi === 'reset') {
      await runShell(`wm density reset`);
      logMsg("Đã khôi phục DPI mặc định");
    } else {
      await runShell(`wm density ${dpi}`);
      logMsg(`Đã đổi DPI thành ${dpi}`);
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

  return (
    <>
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
          <button className={`btn ${refreshRate === 'auto' ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyRefreshRate('auto')}>Tương Thích</button>
          {[60, 90, 120].map(r => (
            <button key={r} className={`btn ${refreshRate === r ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '11px' }} onClick={() => applyRefreshRate(r as any)}>{r}Hz</button>
          ))}
        </div>
      </div>

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
    </>
  );
}
