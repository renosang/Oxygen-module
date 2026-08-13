import { useState } from 'react';
import { useKsu } from './hooks/useKsu';
import { LayoutDashboard, DownloadCloud, Settings2 } from 'lucide-react';
import './index.css';

// Import components
import DeviceTab from './components/DeviceTab';
import ApkTab from './components/ApkTab';
import TweaksTab from './components/TweaksTab';

function App() {
  const [activeTab, setActiveTab] = useState<string>('info');
  const { hasRoot } = useKsu();
  const tabs = ['info', 'apk', 'tweaks'];

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
      <div className="nav-tabs" style={{ position: 'relative' }}>
        {/* Sliding Indicator */}
        <div 
          style={{
            position: 'absolute',
            top: '6px', 
            bottom: '6px',
            width: 'calc(33.333% - 4px)', // 3 tabs, minus padding
            left: `calc(${tabs.indexOf(activeTab) * 33.333}% + 3px)`,
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

        <button className={`tab-btn ${activeTab === 'apk' ? 'active' : ''}`} onClick={() => setActiveTab('apk')}>
            <DownloadCloud size={20} />
            <span>Cài APK</span>
        </button>
        <button className={`tab-btn ${activeTab === 'tweaks' ? 'active' : ''}`} onClick={() => setActiveTab('tweaks')}>
            <Settings2 size={20} />
            <span>Tiện Ích</span>
        </button>
      </div>

      {/* Main Content Area with Sliding Animation */}
      <div className="content-area" style={{ overflow: 'hidden', flex: 1, position: 'relative' }}>
        <div 
          style={{ 
            display: 'flex', 
            width: '300%', 
            height: '100%', 
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', 
            transform: `translateX(-${tabs.indexOf(activeTab) * 33.333}%)` 
          }}
        >
          <div style={{ width: '33.333%', height: '100%', overflowY: 'auto' }}><DeviceTab isActive={activeTab === 'info'} /></div>
          <div style={{ width: '33.333%', height: '100%', overflowY: 'auto' }}><ApkTab isActive={activeTab === 'apk'} /></div>
          <div style={{ width: '33.333%', height: '100%', overflowY: 'auto' }}><TweaksTab isActive={activeTab === 'tweaks'} /></div>
        </div>
      </div>
    </div>
  );
}

export default App;
