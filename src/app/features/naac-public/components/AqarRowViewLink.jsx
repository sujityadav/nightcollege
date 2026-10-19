import { getAqarRowViewHref } from '@/app/utils/aqarRowDocument';

export default function AqarRowViewLink({ row, className = 'text-[#0563c1] underline' }) {
  const href = getAqarRowViewHref(row);
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      View Link
    </a>
  );
}
