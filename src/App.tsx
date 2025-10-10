import { useState, useEffect } from 'react';
import { Shield, AlertCircle, Search, Menu, X } from 'lucide-react';
import Home from './components/Home';
import ReportIncident from './components/ReportIncident';
import SOSButton from './components/SOSButton';
import TrackReport from './components/TrackReport';
import { isOnline, getOfflineReports } from './lib/offline';

type View = 'home' | 'report' | 'track' | 'sos';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [online, setOnline] = useState(isOnline());
  const [offlineCount, setOfflineCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(isOnline());
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const interval = setInterval(() => {
      setOfflineCount(getOfflineReports().length);
    }, 1000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'report':
        return <ReportIncident onBack={() => setCurrentView('home')} />;
      case 'track':
        return <TrackReport onBack={() => setCurrentView('home')} />;
      case 'sos':
        return <SOSButton onBack={() => setCurrentView('home')} />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-rose-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Suraksha</h1>
                <p className="text-xs text-slate-600">Women Safety Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!online && (
                <div className="flex items-center space-x-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Offline Mode</span>
                  {offlineCount > 0 && (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {offlineCount} pending
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <nav className="hidden sm:flex space-x-2">
                <NavButton
                  active={currentView === 'home'}
                  onClick={() => setCurrentView('home')}
                >
                  Home
                </NavButton>
                <NavButton
                  active={currentView === 'report'}
                  onClick={() => setCurrentView('report')}
                >
                  Report
                </NavButton>
                <NavButton
                  active={currentView === 'track'}
                  onClick={() => setCurrentView('track')}
                >
                  Track
                </NavButton>
              </nav>
            </div>
          </div>

          {menuOpen && (
            <div className="sm:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col space-y-2">
                <MobileNavButton
                  active={currentView === 'home'}
                  onClick={() => {
                    setCurrentView('home');
                    setMenuOpen(false);
                  }}
                >
                  Home
                </MobileNavButton>
                <MobileNavButton
                  active={currentView === 'report'}
                  onClick={() => {
                    setCurrentView('report');
                    setMenuOpen(false);
                  }}
                >
                  Report Incident
                </MobileNavButton>
                <MobileNavButton
                  active={currentView === 'track'}
                  onClick={() => {
                    setCurrentView('track');
                    setMenuOpen(false);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Track Report
                </MobileNavButton>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderView()}
      </main>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-rose-600 text-white shadow-md'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center ${
        active
          ? 'bg-rose-600 text-white shadow-md'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default App;
