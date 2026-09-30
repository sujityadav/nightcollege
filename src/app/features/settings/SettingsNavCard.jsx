'use client';

import Link from 'next/link';

export default function SettingsNavCard({ href, title, description, icon = 'pi pi-th-large' }) {
  return (
    <Link
      href={href}
      className="bg-white card-shadow p-6 flex flex-col gap-3 min-w-[220px] max-w-[280px] hover:opacity-95 transition-opacity"
    >
      <i className={`${icon} text-[28px] text-[#af251c]`} />
      <div>
        <h3 className="text-[#19212A] text-[18px] font-[700] m-0">{title}</h3>
        {description ? <p className="text-[#64748b] text-sm mt-1 mb-0">{description}</p> : null}
      </div>
    </Link>
  );
}
