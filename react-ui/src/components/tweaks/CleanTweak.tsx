import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function CleanTweak({ logMsg }: { logMsg: (msg: string) => void }) {
  const { runShell } = useKsu();

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

  return (
    <>
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

      {showCleanModal && (
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
      )}
    </>
  );
}
