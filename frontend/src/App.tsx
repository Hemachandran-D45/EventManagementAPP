import React, { useState } from 'react';
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

export const App: React.FC = () => {
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-4 pb-24">
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
