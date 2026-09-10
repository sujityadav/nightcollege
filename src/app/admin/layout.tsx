import Top from '../components/layout/top';
import Left from '../components/layout/left';
import { StoreProvider } from '@/StoreProvider';
import { BreadcrumbProvider } from '@/app/context/BreadcrumbContext';

export default function Layout({ children }: { children: React.ReactNode }) {
 


  return (
    <>
     <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Left/>
        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <Top/>

          {/* Main content */}
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <StoreProvider>{children}</StoreProvider>
          </main>
        </div>
      </div>
     </BreadcrumbProvider>
    </>
  );
}
