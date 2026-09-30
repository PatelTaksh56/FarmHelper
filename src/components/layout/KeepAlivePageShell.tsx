import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Overview } from '../../pages/Overview';
import { MyFarm } from '../../pages/MyFarm';
import { CropDoctor } from '../../pages/CropDoctor';
import { CropAdvisor } from '../../pages/CropAdvisor';
import { Weather } from '../../pages/Weather';
import { MarketMandi } from '../../pages/MarketMandi';
import { GovernmentSchemes } from '../../pages/GovernmentSchemes';
import { Settings } from '../../pages/Settings';
import { HelpSupport } from '../../pages/HelpSupport';

interface RouteItem {
  path: string;
  component: React.ComponentType<any>;
}

const SIDEBAR_ROUTES: RouteItem[] = [
  { path: '/', component: Overview },
  { path: '/my-farm', component: MyFarm },
  { path: '/crop-doctor', component: CropDoctor },
  { path: '/crop-advisor', component: CropAdvisor },
  { path: '/weather', component: Weather },
  { path: '/market-mandi', component: MarketMandi },
  { path: '/government-schemes', component: GovernmentSchemes },
  { path: '/settings', component: Settings },
  { path: '/help-support', component: HelpSupport },
];

interface KeepAlivePageShellProps {
  onOpenLogoutModal: () => void;
}

export const KeepAlivePageShell: React.FC<KeepAlivePageShellProps> = ({ onOpenLogoutModal }) => {
  const location = useLocation();

  // Normalize path ('/overview' -> '/')
  const rawPath = location.pathname;
  const currentPath = rawPath === '/overview' ? '/' : rawPath;

  // Set of visited route paths during active user session
  const [visitedRoutes, setVisitedRoutes] = useState<Set<string>>(() => new Set([currentPath]));

  useEffect(() => {
    if (currentPath && !visitedRoutes.has(currentPath)) {
      setVisitedRoutes((prev) => new Set([...prev, currentPath]));
    }
  }, [currentPath]);

  return (
    <div className="w-full relative">
      {SIDEBAR_ROUTES.map(({ path, component: Component }) => {
        const isMounted = visitedRoutes.has(path);
        const isActive = currentPath === path;

        if (!isMounted) return null;

        return (
          <div
            key={path}
            className={isActive ? 'block w-full animate-fadeIn' : 'hidden'}
            aria-hidden={!isActive}
          >
            <Component onOpenLogoutModal={onOpenLogoutModal} />
          </div>
        );
      })}
    </div>
  );
};
