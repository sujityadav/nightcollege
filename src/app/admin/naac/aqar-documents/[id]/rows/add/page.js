'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyAqarRowFormRedirect() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.id;

  useEffect(() => {
    if (documentId) {
      router.replace(`/admin/naac/aqar-documents/${documentId}`);
    }
  }, [documentId, router]);

  return null;
}
