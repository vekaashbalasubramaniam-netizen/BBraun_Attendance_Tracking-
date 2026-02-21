
import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  TableProperties, 
  TrendingUp, 
  BrainCircuit,
  Menu,
  X
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setView: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: '1. Upload Reports', icon: Upload },
    { id: 'extraction', label: '2. Data Extraction', icon: Search },
    { id: 'analysis', label: '3. Cross-Examine', icon: TableProperties },
    { id: 'analytics', label: '4. Analytics', icon: TrendingUp },
    { id: 'training', label: 'AI Training Lab', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-full flex items-center justify-center mb-2">
            {/* B Braun Styled Logo */}
            <div className="text-2xl font-black tracking-tighter text-gray-900 flex items-center">
              B<span className="text-[#00A97A] mx-0.5">|</span>BRAUN
            </div>
          </div>
          {isSidebarOpen && (
            <p className="text-[10px] text-[#00A97A] font-bold tracking-widest uppercase">Attendance Tracker</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-[#00A97A] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#00A97A]'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-4 border-t border-gray-100 flex justify-center text-gray-400 hover:text-[#00A97A] transition-colors"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              {navItems.find(i => i.id === activeView)?.label || activeView}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">System Status</span>
              <span className="text-xs font-semibold text-[#00A97A]">Online & Secured</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#00A97A] font-black text-sm">
              BB
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
