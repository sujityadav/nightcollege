'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type DepartmentStyleNavItem = {
  label: string;
  href: string;
  key?: string;
  icon?: string;
};

type DepartmentStyleSidebarProps = {
  title: string;
  navItems: DepartmentStyleNavItem[];
  headerIcon?: string;
};

const defaultItemIcon = 'pi pi-file';

export default function DepartmentStyleSidebar({
  title,
  navItems,
  headerIcon = 'pi pi-book',
}: DepartmentStyleSidebarProps) {
  const pathname = usePathname();

  const matchingItems = navItems.filter(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  );
  const mostSpecific =
    matchingItems.length > 0
      ? matchingItems.reduce((best, current) =>
          current.href.length > best.href.length ? current : best
        )
      : null;

  return (
    <aside className="h-fit overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.12)] lg:sticky lg:top-4">
      <div className="flex items-center gap-3 bg-primarycolor px-4 py-3 text-white">
        <i className={`${headerIcon} text-lg`} aria-hidden="true" />
        <h2 className="font-serif text-base font-bold">{title}</h2>
      </div>
      <nav aria-label={`${title} sections`} className="max-h-[70vh] overflow-y-auto p-1.5">
        {navItems.map((item) => {
          const isActive = mostSpecific?.href === item.href;
          const icon = item.icon || defaultItemIcon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[12px] transition sm:text-[13px] ${
                isActive
                  ? 'bg-primarycolor font-semibold text-white shadow-sm'
                  : 'border-b border-[#E7EDF7] text-[#183B6D] hover:bg-[#FFF3F1] hover:text-primarycolor'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`${icon} w-4 shrink-0 text-center text-sm`} aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.label}</span>
              <i className="pi pi-angle-right shrink-0 text-xs" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
