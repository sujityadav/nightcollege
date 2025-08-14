'use client';
import { useState } from "react";
import Link from "next/link";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Image from "next/image";
import { ScrollPanel } from "primereact/scrollpanel";


export default function Left() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Menu array with PrimeReact icon class
  const menuItems = [
    { label: "Rebranding", href: "/admin/rebranding", icon: "pi pi-home" },
    { label: "About Us", href: "/admin/about-us", icon: "pi pi-building-columns" },
    { label: "Events", href: "/admin/events", icon: "pi pi-calendar" },
    { label: "News", href: "/admin/news", icon: "pi pi-chart-bar" },
     { label: "All Committees", href: "/admin/all-committees", icon: "pi pi-th-large" },
    { label: "All Department", href: "/admin/all-departments", icon: "pi pi-building" },
    { label: "Administration", href: "/admin/administration", icon: "pi pi-briefcase" },
    { label: "Infrastructure Facilities ", href: "/admin/infrastructure-facilities ", icon: "pi pi-database" },
    { label: "All Staff ", href: "/admin/all-staf", icon: "pi pi-id-card" },
    { label: "College Publication", href: "/admin/college-publication", icon: "pi pi-book" },
    { label: "Alumni", href: "/admin/alumni", icon: "pi pi-id-card" },
    { label: "Student Corner", href: "/admin/student-corner", icon: "pi pi-user" },
    // { label: "Logout", href: "#", icon: "pi pi-sign-out" },
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


        {/* <ScrollPanel className="h-[800px]"> */}
          <ul className="p-4 ">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center p-2 rounded hover:bg-primarycolor hover:text-white space-x-2"
              >
                <i className={`${item.icon}  hover:text-white text-[16px]` }></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </ul>
          {/* </ScrollPanel> */}
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
