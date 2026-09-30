import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogoutModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenLogoutModal }) => {
  const { currentUser, userProfile } = useAuth();
  const { t, isRTL } = useTranslation();

  const navItems = [
    { path: '/', label: t('nav.overview'), icon: 'grid_view' },
    { path: '/my-farm', label: t('nav.myFarm'), icon: 'potted_plant' },
    { path: '/crop-doctor', label: t('nav.cropDoctor'), icon: 'medical_services' },
    { path: '/crop-advisor', label: t('nav.cropAdvisor'), icon: 'psychology' },
    { path: '/weather', label: t('nav.weather'), icon: 'partly_cloudy_day' },
    { path: '/market-mandi', label: t('nav.marketMandi'), icon: 'storefront' },
    { path: '/government-schemes', label: t('nav.govSchemes'), icon: 'policy' },
    { path: '/settings', label: t('nav.settings'), icon: 'settings' },
    { path: '/help-support', label: t('nav.helpSupport'), icon: 'help' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charred-soil/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 bg-[#FFFDF9] border-r border-pressed-sand flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isRTL ? 'right-0 border-l border-r-0' : 'left-0 border-r'
        } ${
          isOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-pressed-sand">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F4E8] border border-[#91A35A]/30 flex items-center justify-center text-harvest-olive">
              <span className="material-symbols-outlined text-2xl">agriculture</span>
            </div>
            <div>
              <span className="font-headline font-bold text-xl text-charred-soil tracking-tight">
                FarmHelper
              </span>
              <p className="text-[11px] font-medium text-umber-brown uppercase tracking-wider">
                Agrarian Intelligence
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 text-umber-brown hover:text-charred-soil cursor-pointer"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-harvest-olive text-[#FFFDF9] shadow-sm font-semibold'
                    : 'text-umber-brown hover:bg-[#F3F0E8] hover:text-charred-soil'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'text-[#FFFDF9]' : 'text-umber-brown'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout Trigger */}
        <div className="p-4 border-t border-pressed-sand bg-[#FAF7F2]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-harvest-olive/15 border border-harvest-olive/30 flex items-center justify-center text-harvest-olive font-bold shrink-0">
                {userProfile?.fullName?.[0]?.toUpperCase() ||
                  currentUser?.email?.[0]?.toUpperCase() ||
                  'F'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charred-soil truncate">
                  {userProfile?.fullName || t('nav.progressiveFarmer')}
                </p>
                <p className="text-xs text-umber-brown truncate">
                  {currentUser?.email || currentUser?.phoneNumber || t('nav.activeSession')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenLogoutModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-error-container/40 text-umber-brown hover:text-error text-xs font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>{t('nav.signout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
