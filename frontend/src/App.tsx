import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { InstallPwaModal } from './components/layout/InstallPwaModal';
import { QuickAddOrderModal } from './components/events/QuickAddOrderModal';
import { EventDetailModal } from './components/events/EventDetailModal';
import { ServiceCatalogModal } from './components/services/ServiceCatalogModal';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CustomersPage } from './pages/CustomersPage';
import { FinancePage } from './pages/FinancePage';
import { SearchPage } from './pages/SearchPage';
import { PublicHomePage } from './public/PublicHomePage';
import { SecurityLockScreen } from './components/auth/SecurityLockScreen';
import { api } from './services/api';

const isWebsiteRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.startsWith('/website') || hash.startsWith('#website');
};

export const App: React.FC = () => {
  const [route, setRoute] = useState<'pwa' | 'website'>(() => (isWebsiteRoute() ? 'website' : 'pwa'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => api.isAuthenticated());

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(isWebsiteRoute() ? 'website' : 'pwa');
    };
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('app:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, []);

  const navigateToPwa = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setRoute('pwa');
    window.scrollTo(0, 0);
  };

  const navigateToWebsite = () => {
    try {
      window.history.pushState({}, '', '/website');
    } catch {
      window.location.hash = '#website';
    }
    setRoute('website');
    window.scrollTo(0, 0);
  };

  // Only render marketing website if explicitly requested via #website or /website
  if (route === 'website') {
    return <PublicHomePage onNavigatePortal={navigateToPwa} />;
  }

  // Security gate: If not authenticated, require Owner Passcode
  if (!isAuthenticated) {
    return (
      <SecurityLockScreen
        onUnlocked={() => setIsAuthenticated(true)}
        onNavigateWebsite={navigateToWebsite}
      />
    );
  }

  // Root default (/) is 100% the pure Event Management PWA
  return (
    <PurePwaApp
      onLock={() => {
        api.logout();
        setIsAuthenticated(false);
      }}
    />
  );
};

interface PurePwaProps {
  onLock: () => void;
}

const PurePwaApp: React.FC<PurePwaProps> = ({ onLock }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
        onLock={onLock}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28">
        {currentTab === 'dashboard' && (
          <DashboardPage
            key={refreshTrigger}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onOpenServices={() => setIsServicesOpen(true)}
          />
        )}
        {currentTab === 'events' && (
          <EventsPage
            key={refreshTrigger}
            onSelectEvent={(id) => setSelectedEventId(id)}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}
        {currentTab === 'calendar' && (
          <CalendarPage
            key={refreshTrigger}
            onSelectEvent={(id) => setSelectedEventId(id)}
          />
        )}
        {currentTab === 'customers' && (
          <CustomersPage
            key={refreshTrigger}
            onSelectEvent={(id) => setSelectedEventId(id)}
          />
        )}
        {currentTab === 'finance' && (
          <FinancePage key={refreshTrigger} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Modals & Dialogs */}
      <QuickAddOrderModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onOrderCreated={() => {
          triggerRefresh();
        }}
      />

      <EventDetailModal
        eventId={selectedEventId}
        isOpen={selectedEventId !== null}
        onClose={() => setSelectedEventId(null)}
        onRefresh={() => {
          triggerRefresh();
        }}
      />

      <ServiceCatalogModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
      />

      <SearchPage
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEvent={(id) => setSelectedEventId(id)}
      />

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
};

export default App;
