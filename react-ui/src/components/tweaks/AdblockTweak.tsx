import { ShieldAlert } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function AdblockTweak({ 
  adblockStatus, 
  setAdblockStatus, 
  adblockDate, 
  setAdblockDate, 
  showAlert, 
  logMsg 
}: { 
  adblockStatus: boolean, 
  setAdblockStatus: (v: boolean) => void, 
  adblockDate: string | null, 
  setAdblockDate: (v: string | null) => void, 
  showAlert: (msg: string) => void,
  logMsg: (msg: string) => void
}) {
  const { runShell } = useKsu();
  const getModPath = () => "/data/adb/modules/oneplus_customize";

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

  return (
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
  );
}
