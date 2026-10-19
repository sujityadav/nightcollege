import { naacNavItems } from '@/app/features/naac/sidebarData';

const publicPathByKey = {
  'aqar-documents': '/naac/aqar',
  aqar: '/naac/menu/aqar',
};

const publicIconByKey = {
  'iqac-composition': 'pi pi-users',
  aqar: 'pi pi-chart-line',
  'aqar-documents': 'pi pi-folder-open',
  'iqac-meetings': 'pi pi-calendar',
  'naac-accreditation': 'pi pi-verified',
  ssr: 'pi pi-book',
  aaa: 'pi pi-check-square',
  'green-energy-audit': 'pi pi-leaf',
  'gender-audit': 'pi pi-user',
};

export const naacPublicNavItems = naacNavItems.map((item) => ({
  label: item.label,
  key: item.key,
  href: publicPathByKey[item.key] || `/naac/menu/${item.key}`,
  icon: publicIconByKey[item.key] || 'pi pi-file',
}));
