
import { useState } from 'react';
import Top from '../components/layout/top';
import Left from '../components/layout/left';
import { Metadata } from 'next';
import { StoreProvider } from '@/StoreProvider';



export default async function Layout({ children }: { children: React.ReactNode }) {
 


  return (
    <>
     <div className="flex h-screen">
      {/* Sidebar */}
     <Left/>
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
     <Top/>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <StoreProvider>{children}</StoreProvider>
        </main>
      </div>
    </div>
    </>
  );
}
