import { useState } from 'react';
import { Image, ShieldAlert } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function GooglePhotosTweak({ photosEnabled, setPhotosEnabled, showAlert }: { photosEnabled: boolean, setPhotosEnabled: (v: boolean) => void, showAlert: (msg: string) => void }) {
  const { runShell } = useKsu();
  const [confirmModal, setConfirmModal] = useState<{ msg: string, onConfirm: () => void } | null>(null);

  const getModPath = () => "/data/adb/modules/oneplus_customize";

  const promptEnablePhotos = () => {
    if (photosEnabled) return;
    setConfirmModal({
      msg: "Tính năng này sẽ xóa dữ liệu của ứng dụng Google Photos để áp dụng bản patch (không làm mất ảnh trên Cloud của bạn). Bạn có muốn tiếp tục?",
      onConfirm: enablePhotos
    });
  };

  const enablePhotos = async () => {
    const modpath = getModPath();
    await runShell(`sh ${modpath}/enable_photos.sh ${modpath}`);
    setPhotosEnabled(true);
    setConfirmModal(null);
    showAlert("Kích hoạt Google Photos thành công! Vui lòng khởi động lại máy.");
  };

  return (
    <>
      <div className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div className="item-icon" style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)' }}>
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

      {confirmModal && (
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
              <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setConfirmModal(null)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--accent-red)' }} onClick={confirmModal.onConfirm}>Tiếp Tục</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
