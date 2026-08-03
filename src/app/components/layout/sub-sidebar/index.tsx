'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  key?: string;
}

interface SubSidebarProps {
  title: string;
  navItems: NavItem[];
  onSelect?: (key: string) => void;
  activeKey?: string;
}

const getStorageKey = (title: string) =>
  `sub-sidebar-collapsed:${title.trim().toLowerCase()}`;

const collapsedMemory: Record<string, boolean> = {};

function readCollapsed(storageKey: string): boolean {
  if (typeof window === 'undefined') return false;
  if (Object.prototype.hasOwnProperty.call(collapsedMemory, storageKey)) {
    return collapsedMemory[storageKey];
  }
  try {
    const value = localStorage.getItem(storageKey) === 'true';
    collapsedMemory[storageKey] = value;
    return value;
  } catch {
    return false;
  }
}

function writeCollapsed(storageKey: string, value: boolean) {
  collapsedMemory[storageKey] = value;
  try {
    localStorage.setItem(storageKey, String(value));
  } catch {
  }
}

export const SubSidebar: React.FC<SubSidebarProps> = ({
  title,
  navItems,
  onSelect,
  activeKey,
}) => {
  const storageKey = getStorageKey(title);
  const [collapsed, setCollapsed] = useState(() => readCollapsed(storageKey));
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCollapsed(readCollapsed(storageKey));
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [storageKey]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(storageKey, next);
      return next;
    });
  };

  return (
    <aside
      suppressHydrationWarning
      className={`relative z-10 shrink-0 min-h-screen border-r border-[#C9D3DB] bg-white
    ${collapsed ? 'w-6' : 'w-[260px]'}
    ${ready ? 'transition-all duration-300' : ''}
  `}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-5 z-20 h-6 w-6 flex items-center justify-center border-none bg-transparent text-bgcolor"
        aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
      >
        <i
          className={`pi pi-play-circle text-[#af251c] text-[20px] ${
            collapsed ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {!collapsed && (
        <div className="p-4  ">
          <div className="border-b border-[#E5E7EB] pb-2 mb-3 font-semibold">{title}</div>
          <nav className="flex flex-col space-y-1">
            {navItems.map((item, index) => {
              const matchingItems = navItems.filter(
                (nav) =>
                  pathname === nav.href || pathname.startsWith(`${nav.href}/`)
              );
              const mostSpecific =
                matchingItems.length > 0
                  ? matchingItems.reduce((best, current) =>
                      current.href.length > best.href.length ? current : best
                    )
                  : null;

              const isActive =
                activeKey !== undefined
                  ? activeKey === item.key
                  : mostSpecific?.href === item.href;

              return onSelect ? (
                <button
                  key={item.key || index}
                  type="button"
                  onClick={() => item.key && onSelect(item.key)}
                  className={`text-left text-[#19212A] w-full px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[10px] xl:py-[10px] 3xl:py-[0.521vw] text-sm ${
                    isActive ? 'bg-[#af251c] text-white' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href || index}
                  href={item.href}
                  className={`text-[#19212A] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[10px] xl:py-[10px] 3xl:py-[0.521vw] text-sm ${
                    isActive ? 'bg-[#af251c] text-white' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
};
