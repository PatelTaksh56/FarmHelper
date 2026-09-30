import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { KisanHelplineBar } from './KisanHelplineBar';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';
import { KeepAlivePageShell } from './KeepAlivePageShell';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setIsLogoutModalOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Kisan Helpline Ribbon */}
      <KisanHelplineBar />

      <div className="flex flex-1">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Content Area with RTL awareness */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            isRTL ? 'lg:pr-72 lg:pl-0' : 'lg:pl-72 lg:pr-0'
          }`}
        >
          {/* Mobile Top Header */}
          <header className="lg:hidden h-16 px-4 bg-[#FFFDF9] border-b border-pressed-sand flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-charred-soil hover:bg-[#F3F0E8] rounded-lg transition-colors cursor-pointer"
                aria-label="Open Navigation"
              >
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-harvest-olive text-2xl">agriculture</span>
                <span className="font-headline font-bold text-lg text-charred-soil">FarmHelper</span>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 text-umber-brown hover:text-error transition-colors cursor-pointer"
              title={t('nav.signout')}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </header>

          {/* Persistent Keep-Alive Page Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            <KeepAlivePageShell onOpenLogoutModal={() => setIsLogoutModalOpen(true)} />
          </main>
        </div>
      </div>

      {/* In-Page Logout Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
      />
    </div>
  );
};
