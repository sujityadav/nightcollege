'use client';

import React, { useEffect, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import {
  formatOurDesignation,
  getDeskDetailPath,
} from '@/app/lib/deskRoles';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasDeskContent(data) {
  if (!data) return false;
  return Boolean(data.title?.trim() || data.content?.trim() || data.photo?.trim());
}

function DeskCard({ data, roleSlug, fallbackDesignation }) {
  if (!hasDeskContent(data)) return null;

  const title = data.title?.trim() || '';
  const description = stripHtml(data.content);
  const photo = data.photo?.trim();
  const designationLine = formatOurDesignation(data.designation, fallbackDesignation);
  const detailHref = getDeskDetailPath(roleSlug);

  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {photo ? (
        <div className="shrink-0">
          <Image
            src={photo}
            width={205}
            height={200}
            alt={title || designationLine}
            unoptimized={photo.startsWith('http')}
            className="h-auto w-full max-w-[205px] rounded-md border-2 shadow-lg sm:w-[205px]"
          />
        </div>
      ) : null}
      <div className="min-w-0">
        {title ? (
          <h4 className="font20 font-[500] leading-[140%] text-[#1B212F]">{title}</h4>
        ) : null}
        {designationLine ? (
          <div className="font-[700] leading-none text-primarycolor">{designationLine}</div>
        ) : null}
        {description ? (
          <p className="mt-3 line-clamp-4 font15 font-[400] leading-[120%] text-[#5a5a5a]">
            {description}
          </p>
        ) : null}
        <Link href={detailHref} className="arrow-link mt-2">
          Read more<span className="arrow"></span>
        </Link>
      </div>
    </div>
  );
}

export default function Desk() {
  const [principal, setPrincipal] = useState(null);
  const [chairperson, setChairperson] = useState(null);

  useEffect(() => {
    const loadDeskData = async () => {
      try {
        const [principalRes, chairpersonRes] = await Promise.all([
          axios.get('/api/about-us/public', { params: { type: 'desk' } }),
          axios.get('/api/about-us/public', { params: { type: 'chairman_desk' } }),
        ]);

        if (principalRes.data?.data) setPrincipal(principalRes.data.data);
        if (chairpersonRes.data?.data) setChairperson(chairpersonRes.data.data);
      } catch {
        // Keep section hidden when data is unavailable
      }
    };

    loadDeskData();
  }, []);

  const showPrincipal = hasDeskContent(principal);
  const showChairperson = hasDeskContent(chairperson);

  if (!showPrincipal && !showChairperson) {
    return null;
  }

  return (
    <div className="w-full py50">
      <div className="px300">
        <div className="title pb30">
          <div className={roboto_slab.className}>
            <h1 className="font26 font-[700] leading-[140%] text-[#1B212F]">FROM THE DESK OF…</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {showPrincipal ? (
            <DeskCard data={principal} roleSlug="principal" fallbackDesignation="Principal" />
          ) : null}
          {showChairperson ? (
            <DeskCard
              data={chairperson}
              roleSlug="chairperson"
              fallbackDesignation="Chairperson"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
