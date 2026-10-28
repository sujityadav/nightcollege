import { redirect } from 'next/navigation';

export default function TeachingStaffLegacyPage() {
  redirect('/staff?type=teaching');
}
