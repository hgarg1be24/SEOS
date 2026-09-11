import { useState, useEffect, useRef } from 'react';
import type { ViewId } from './types';
import { NAV_ITEMS } from './mockData';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MainWorkspace from './components/MainWorkspace';
import { useStore } from './store';

const VIEW_TITLES: Record<ViewId, string> = {
  overview: 'Project Overview',
  requirements: 'Requirements Engineer',
  'user-stories': 'User Stories',
  modeling: 'System Modeling',
  architecture: 'Architecture',
  'api-designer': 'API Designer',
  documentation: 'Documentation',
  learning: 'Learning Dashboard',
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightSidebarOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(340);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = rightWidth;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = startWidth.current + (startX.current - e.clientX);
      setRightWidth(Math.min(Math.max(newWidth, 260), 600));
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-seos-bg text-seos-text transition-colors duration-200">
      <LeftSidebar 
        items={NAV_ITEMS}
        activeView={activeView} 
        onNavigate={setActiveView} 
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(!leftCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b border-seos-border bg-seos-surface flex items-center justify-between px-4 shrink-0">
          <h1 className="text-lg font-semibold text-seos-text">{VIEW_TITLES[activeView] || 'SEOS'}</h1>
          
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-sm bg-seos-accent hover:bg-seos-accent-2 text-white rounded transition-colors font-medium">
              Generate with AI
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded hover:bg-seos-surface-2 text-seos-text-2 transition-colors flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-1.5 rounded hover:bg-seos-surface-2 text-seos-text-2 transition-colors flex items-center justify-center"
                title="More Actions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-seos-surface border border-seos-border rounded-md shadow-lg z-50 py-1">
                  {['Export as Markdown', 'Export as PDF', 'Share Project', 'Settings', 'Reset View'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        console.log(action);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-seos-text hover:bg-seos-surface-2 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <MainWorkspace activeView={activeView} />
          
          {rightSidebarOpen && (
            <>
              <div 
                className="w-1 h-full cursor-col-resize bg-transparent hover:bg-seos-accent/50 transition-colors z-10 shrink-0"
                onMouseDown={handleMouseDown}
              />
              <div style={{ width: rightWidth }} className="h-full shrink-0 flex flex-col">
                <RightSidebar width={rightWidth} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
