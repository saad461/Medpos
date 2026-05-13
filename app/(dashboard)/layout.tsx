import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardHeader } from '@/components/shared/dashboard-header';
import { CrispChat } from '@/components/shared/crisp-chat';
import { ErrorBoundary } from '@/components/shared/error-boundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <DashboardSidebar />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Top Header */}
        <DashboardHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <CrispChat />
    </div>
  );
}
