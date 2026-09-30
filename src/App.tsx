import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { MyFarm } from './pages/MyFarm';
import { CropDoctor } from './pages/CropDoctor';
import { CropAdvisor } from './pages/CropAdvisor';
import { Weather } from './pages/Weather';
import { MarketMandi } from './pages/MarketMandi';
import { GovernmentSchemes } from './pages/GovernmentSchemes';
import { Settings } from './pages/Settings';
import { HelpSupport } from './pages/HelpSupport';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Registration Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Protected Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/overview" element={<Navigate to="/" replace />} />
              <Route path="/my-farm" element={<MyFarm />} />
              <Route path="/crop-doctor" element={<CropDoctor />} />
              <Route path="/crop-advisor" element={<CropAdvisor />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/market-mandi" element={<MarketMandi />} />
              <Route path="/government-schemes" element={<GovernmentSchemes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help-support" element={<HelpSupport />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
