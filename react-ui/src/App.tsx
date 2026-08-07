import { useState } from 'react';
import { useKsu } from './hooks/useKsu';
import { LayoutDashboard, Snowflake, DownloadCloud, Settings2 } from 'lucide-react';
import './index.css';

// Import components
import DeviceTab from './components/DeviceTab';
import FreezeTab from './components/FreezeTab';
import ApkTab from './components/ApkTab';
import TweaksTab from './components/TweaksTab';

function App() {
  const [activeTab, setActiveTab] = useState<string>('info');
  const { hasRoot } = useKsu();
  const tabs = ['info', 'freeze', 'apk', 'tweaks'];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info': return <DeviceTab />;
      case 'freeze': return <FreezeTab />;
      case 'apk': return <ApkTab />;
      case 'tweaks': return <TweaksTab />;
      default: return <DeviceTab />;
    }
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
      <div className="nav-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            <LayoutDashboard size={20} />
            <span>Tổng Quan</span>
        </button>
        <button className={`tab-btn ${activeTab === 'freeze' ? 'active' : ''}`} onClick={() => setActiveTab('freeze')}>
            <Snowflake size={20} />
            <span>Đóng Băng</span>
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

      {/* Main Content Area */}
      <div className="content-area">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default App;
