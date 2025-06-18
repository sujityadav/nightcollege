'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

interface SubSidebarProps {
  title: string;
  navItems: NavItem[];
}

export const SubSidebar: React.FC<SubSidebarProps> = ({ title, navItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative min-h-screen border-r bg-white transition-all duration-300 ${
        collapsed ? 'w-6' : ' xl:w-[180px] 3xl:w-[9.375vw]'
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 h-6 w-6  flex items-center justify-center border-none bg-transparent text-bgcolor"
      >
        <i
          className={`pi pi-arrow-circle-left text-[20px] ${
            collapsed ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {!collapsed && (
        <div className="p-4">
          <div className="border-b pb-2 mb-2 font-semibold">{title}</div>
          <nav className="flex flex-col">
            {navItems.map((item, index) => (
              <Link
                key={item.href || index}
                href={item.href}
                className={`py-1 px-2 text-sm ${
                  pathname === item.href
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
};
