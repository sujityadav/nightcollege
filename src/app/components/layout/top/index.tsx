'use client';

import React, { useState, useRef } from "react";
import Link from "next/link";
import { OverlayPanel } from 'primereact/overlaypanel';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function Top({ ...pageProps }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const op = useRef(null);

  // Example user
  const user = {
    name: "John Doe",
    avatar: "" // You can add your avatar image URL here
  };

  return (
    <header className="flex items-center justify-between bg-transparent shadow-sm h-[80px] px-5 sticky top-0 z-20 border-b border-[#BECDE3]">
      {/* Sidebar toggle */}
      <button
        className="md:hidden text-gray-600"
        onClick={() => setSidebarOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <div className="flex space-x-[8px] items-center mb-1">
          <Link href='' className="text-[#9CA1AB] text-[12px] xl:text-[0.729vw] leading-none">Home</Link>
          <i className="pi pi-angle-right text-[8px] text-[#9CA1AB]"></i>
           <Link href='' className="text-[#9CA1AB] text-[12px] xl:text-[0.729vw] leading-none">Page 1</Link>
          <i className="pi pi-angle-right text-[8px] text-[#9CA1AB]"></i>
          <Link href=''  className="text-[#374151] text-[12px] xl:text-[0.729vw] leading-none">Current Page</Link>
          </div>


        {/* Title */}
        <div className="text-[#374151] text-[18px] xl:text-[0.938vw] font-semibold leading-[1.2]">Dashboard</div>
      </div>

      {/* Profile section */}
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={(e) => op.current.toggle(e)}
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <i className="pi pi-user text-white"></i>
        </div>
        <span className="hidden sm:inline">{user.name}</span>
      </div>

      {/* Overlay Panel */}
      <OverlayPanel ref={op}>
        <div className="space-y-2">
          <Link href="#" className="flex items-center space-x-2 hover:text-blue-500">
            <i className="pi pi-user"></i>
            <span>Profile</span>
          </Link>
          <Link href="#" className="flex items-center space-x-2 hover:text-blue-500">
            <i className="pi pi-cog"></i>
            <span>Settings</span>
          </Link>
          <Link href="#" className="flex items-center space-x-2 hover:text-blue-500">
            <i className="pi pi-sign-out"></i>
            <span>Logout</span>
          </Link>
        </div>
      </OverlayPanel>
    </header>
  );
}
