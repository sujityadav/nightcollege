'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SubSidebar: React.FC<SidebarProps> = ({ title, navItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <aside
        className={cn(
          'relative min-h-screen border-r border-InterfaceStrokedefault bg-background transition-all duration-300 ease-in-out ',
          collapsed
            ? 'min-w-[18px] 3xl:min-w-[0.938vw] w-[18px] 3xl:w-[0.938vw]'
            : 'min-w-[200px] md:min-w-[150px] lg:min-w-[220px] xl:min-w-[240px] 3xl:min-w-[12.917vw] w-[200px] md:w-[150px] lg:w-[220px] xl:w-[240px] 3xl:w-[12.917vw]'
        )}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 h-[26px] 3xl:h-[1.354vw] w-[26px] 3xl:w-[1.354vw] rounded-full bg-InterfaceTextlighter-200 hover:bg-[#C9D0DB]-200 shadow-md flex items-center justify-center xl:text-[14px] 2xl:text-[16px] 3xl:text-[0.833vw] font-[500] z-10"
        >
          {collapsed ? (
            <i className="cloud-arrow-left1 rotate-180 rounded-full  text-[26px]  text-BrandSupport1pure bg-background "></i>
          ) : (
            <i className="cloud-arrow-left1 rounded-full text-InterfaceTextlighter text-[26px] bg-background hover:text-BrandSupport1pure"></i>
          )}
        </button>

        {/* Content */}
        <div className={cn('p-4 transition-opacity', collapsed && 'opacity-0 pointer-events-none')}>
          <div className="  border-b borde-[#E5E7EB] p-[16px] 3xl:p-[0.833vw] text-InterfaceTexttitle text-[16px] 3xl:text-[0.833vw] font-[500] leading-[140%]">
            {title}
          </div>
          <nav className="flex flex-col">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item?.href}
                className={cn(
                  'text-left py-2 px-4 text-sm transition-colors',
                  // pathname.includes(item?.href)
                  pathname === item?.href
                    ? 'bg-BrandNeutral500 text-background font-semibold'
                    : 'text-InterfaceTextdefault font-normal'
                )}
              >
                {item?.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      {/* <main className="flex-1 p-6">{activeIndex !== null && navItems[activeIndex]?.component}</main> */}
    </>
  );
};
