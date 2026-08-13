import { useState, useRef, useEffect } from 'react';
import { useKsu } from './hooks/useKsu';
import { useTweaks } from './hooks/useTweaks';
import { LayoutDashboard, DownloadCloud, Monitor, Activity, ShieldCheck, Cpu, ShieldAlert } from 'lucide-react';
import './index.css';

// Import components
import DeviceTab from './components/DeviceTab';
import ApkTab from './components/ApkTab';

import GooglePhotosTweak from './components/tweaks/GooglePhotosTweak';
import AdblockTweak from './components/tweaks/AdblockTweak';
import DebloatTweak from './components/tweaks/DebloatTweak';
import PerformanceTweaks from './components/tweaks/PerformanceTweaks';
import DisplayTweaks from './components/tweaks/DisplayTweaks';
import NetworkTweaks from './components/tweaks/NetworkTweaks';
import SecurityTweaks from './components/tweaks/SecurityTweaks';
import CleanTweak from './components/tweaks/CleanTweak';

function App() {
  const [activeTab, setActiveTab] = useState<string>('info');
  const { hasRoot } = useKsu();
  
  // Custom hook for tweaks state
  const tweaks = useTweaks(true); // Always active so it fetches once
  
  const tabs = ['info', 'system', 'performance', 'display', 'security', 'apk'];
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const activeIndex = tabs.indexOf(activeTab);
      const tabWidth = navRef.current.scrollWidth / tabs.length;
      navRef.current.scrollTo({
        left: activeIndex * tabWidth - (navRef.current.clientWidth / 2) + (tabWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const minSwipeDistance = 50; 

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    
    // Only trigger if it's mostly horizontal (X distance > Y distance)
    if (Math.abs(distanceX) > distanceY) {
        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;
        
        if (isLeftSwipe || isRightSwipe) {
           const currentIndex = tabs.indexOf(activeTab);
           if (isLeftSwipe && currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1]);
           } else if (isRightSwipe && currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1]);
           }
        }
    }
    // reset
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  return (
    <div 
      className="app-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <div className="header-icon">1<span>+</span></div>
          <div className="header-text">
            <h1 className="outfit-font">Oneplus Customize</h1>
            <p>Siêu tùy biến OxygenOS</p>
          </div>
        </div>
        <div 
          className="status-badge"
          style={{
            background: hasRoot ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            borderColor: hasRoot ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
            color: hasRoot ? "var(--accent-green)" : "var(--accent-red)"
          }}
        >
          <div 
            className="status-dot"
            style={{
              background: hasRoot ? "var(--accent-green)" : "var(--accent-red)",
              boxShadow: hasRoot ? "0 0 8px var(--accent-green)" : "0 0 8px var(--accent-red)",
              animation: hasRoot ? "pulse-glow 2s infinite" : "none"
            }}
          ></div>
          <span>{hasRoot ? "KernelSU Active" : "Detecting Root..."}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ position: 'relative' }} ref={navRef}>
        {/* Sliding Indicator */}
        <div 
          style={{
            position: 'absolute',
            top: '6px', 
            bottom: '6px',
            width: 'calc(25% - 4px)', // 4 tabs per view
            left: `calc(${tabs.indexOf(activeTab) * 25}% + 3px)`,
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            borderRadius: '12px',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: 0
          }} 
        />
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            <LayoutDashboard size={20} />
            <span>Tổng Quan</span>
        </button>

        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
            <Cpu size={20} />
            <span>Hệ Thống</span>
        </button>
        <button className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
            <Activity size={20} />
            <span>Hiệu Năng</span>
        </button>
        <button className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`} onClick={() => setActiveTab('display')}>
            <Monitor size={20} />
            <span>Màn Hình</span>
        </button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <ShieldCheck size={20} />
            <span>Bảo Mật</span>
        </button>
        <button className={`tab-btn ${activeTab === 'apk' ? 'active' : ''}`} onClick={() => setActiveTab('apk')}>
            <DownloadCloud size={20} />
            <span>Cài APK</span>
        </button>
      </div>

      {/* Global Alerts / Logs from tweaks */}
      {tweaks.logs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '11px', color: 'var(--accent-cyan)' }}>
          {tweaks.logs[0]}
        </div>
      )}

      {/* Main Content Area with Sliding Animation */}
      <div className="content-area" style={{ overflow: 'hidden', flex: 1, position: 'relative' }}>
        <div 
          style={{ 
            display: 'flex', 
            width: '600%', 
            height: '100%', 
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', 
            transform: `translateX(-${tabs.indexOf(activeTab) * 16.666}%)` 
          }}
        >
          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto' }}>
            <DeviceTab isActive={activeTab === 'info'} />
          </div>
          
          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <GooglePhotosTweak photosEnabled={tweaks.photosEnabled} setPhotosEnabled={tweaks.setPhotosEnabled} showAlert={tweaks.showAlert} />
            <AdblockTweak adblockStatus={tweaks.adblockStatus} setAdblockStatus={tweaks.setAdblockStatus} adblockDate={tweaks.adblockDate} setAdblockDate={tweaks.setAdblockDate} showAlert={tweaks.showAlert} logMsg={tweaks.logMsg} />
            <DebloatTweak showAlert={tweaks.showAlert} logMsg={tweaks.logMsg} />
            <CleanTweak logMsg={tweaks.logMsg} />
          </div>

          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <PerformanceTweaks antiKill={tweaks.antiKill} setAntiKill={tweaks.setAntiKill} gmsDoze={tweaks.gmsDoze} setGmsDoze={tweaks.setGmsDoze} logMsg={tweaks.logMsg} updateBootScript={tweaks.updateBootScript} />
            <NetworkTweaks dns={tweaks.dns} setDns={tweaks.setDns} bbr={tweaks.bbr} setBbr={tweaks.setBbr} logMsg={tweaks.logMsg} updateBootScript={tweaks.updateBootScript} />
          </div>

          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <DisplayTweaks refreshRate={tweaks.refreshRate} setRefreshRate={tweaks.setRefreshRate} animScale={tweaks.animScale} setAnimScale={tweaks.setAnimScale} forceFps={tweaks.forceFps} setForceFps={tweaks.setForceFps} logMsg={tweaks.logMsg} updateBootScript={tweaks.updateBootScript} />
          </div>

          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <SecurityTweaks playIntegrity={tweaks.playIntegrity} setPlayIntegrity={tweaks.setPlayIntegrity} thermal={tweaks.thermal} setThermal={tweaks.setThermal} logMsg={tweaks.logMsg} updateBootScript={tweaks.updateBootScript} />
          </div>

          <div style={{ width: '16.666%', height: '100%', overflowY: 'auto' }}>
            <ApkTab isActive={activeTab === 'apk'} />
          </div>
        </div>
      </div>

      {tweaks.modalMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => tweaks.setModalMsg('')}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'scale-up 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Thông Báo</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {tweaks.modalMsg}
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => tweaks.setModalMsg('')}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
