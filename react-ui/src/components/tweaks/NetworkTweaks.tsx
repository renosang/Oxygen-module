import { Globe, Wifi } from 'lucide-react';
import { useKsu } from '../../hooks/useKsu';

export default function NetworkTweaks({ 
  dns, 
  setDns, 
  bbr, 
  setBbr, 
  logMsg, 
  updateBootScript 
}: { 
  dns: string, 
  setDns: (v: string) => void, 
  bbr: boolean, 
  setBbr: (v: boolean) => void, 
  logMsg: (msg: string) => void,
  updateBootScript: (k: string, c: string, r: boolean) => Promise<void>
}) {
  const { runShell } = useKsu();

  const applyDNS = async (server: string) => {
    setDns(server);
    let cmd = `settings put global private_dns_mode opportunistic`;
    if (server === 'cloudflare') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier 1dot1dot1dot1.cloudflare-dns.com`;
    else if (server === 'google') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.google`;
    else if (server === 'adguard') cmd = `settings put global private_dns_mode hostname && settings put global private_dns_specifier dns.adguard.com`;

    await runShell(cmd);
    logMsg(`Đã chuyển đổi DNS sang ${server.toUpperCase()}`);
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

  return (
    <>
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
    </>
  );
}
