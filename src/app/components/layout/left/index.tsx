'use client';
import { useState } from "react";
import Link from "next/link";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Image from "next/image";


export default function Left() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Menu array with PrimeReact icon class
  const menuItems = [
    { label: "Rebranding", href: "#", icon: "pi pi-home" },
    { label: "About Us", href: "#", icon: "pi pi-user" },
    { label: "Events", href: "#", icon: "pi pi-cog" },
    { label: "News", href: "#", icon: "pi pi-chart-bar" },
    { label: "Logout", href: "#", icon: "pi pi-sign-out" },
  ];

  return (
    <>
    
      <div
        className={`fixed z-30 inset-y-0 left-0 xl:w-[210px] 3xl:w-[11.458vw] bg-[#fff] border-r border-[#BECDE3] custom-shadow transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-200 ease-in-out md:relative md:translate-x-0 `}
      >
        <div className=" p-4 border-b">
         <Image src='/images/admin/admin-logo.png' width={157} height={60} alt='logo'/>
                   <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>
        <div className="left_menu">


          <ul className="p-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center p-2 rounded hover:bgcolor space-x-2"
              >
                <i className={`${item.icon} text-gray-600`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </ul>
        </div>

        <div className="absolute left-0 right-0 bottom-0 left_menu">
          <ul className="p-4 space-y-2">
            <Link

              href=''
              className="flex items-center p-2 rounded hover:bg-gray-200 space-x-2"
            >
              <i className="pi pi-cog"></i>
              <span>Settings</span>
            </Link>
            <Link

              href=''
              className="flex items-center p-2 rounded hover:bg-gray-200 space-x-2"
            >
              <i className="pi pi-sign-out"></i>
              <span>Logout</span>
            </Link>

          </ul>
        </div>
      </div>
    </>
  );
}
