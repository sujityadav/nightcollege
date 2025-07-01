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
      className={`relative min-h-screen border-r border-[#C9D3DB] bg-white transition-all duration-300 ${
        collapsed ? 'w-6' : ' xl:w-min-[230px] 3xl:w-min-[12.5vw]'
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 h-6 w-6  flex items-center justify-center border-none bg-transparent text-bgcolor"
      >
        <i
          className={`pi pi-play-circle text-[#af251c] text-[20px] ${
            collapsed ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {!collapsed && (
        <div className="p-4">
          <div className="border-b border-[#E5E7EB] pb-2 mb-3 font-semibold">{title}</div>
          <nav className="flex flex-col space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.href || index}
                href={item.href}
                className={`text-[#19212A] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[10px] xl:py-[10px] 3xl:py-[0.521vw] text-sm ${
                  pathname === item.href
                    ? 'bg-[#af251c] text-white'
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
