'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import axios from 'axios';
import { splitQuickLinksIntoColumns } from '@/app/utils/quickLinkPublic';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const COLUMN_COUNT = 5;

function QuickLinkItem({ link }) {
  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primarycolor"
      >
        {link.title}
      </a>
    </li>
  );
}

export default function QuickLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuickLinks = async () => {
      try {
        const response = await axios.get('/api/quick-links/public');
        setLinks(response.data?.data || []);
      } catch {
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuickLinks();
  }, []);

  const columns = useMemo(
    () => splitQuickLinksIntoColumns(links, COLUMN_COUNT),
    [links]
  );

  return (
    <div className="w-full py50 bg-[#f5f5f5]">
      <div className="px300">
        <div className="title pb30">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Quick Links
            </h1>
          </div>
        </div>
        <div className="px-2 text-[#5a5a5a] sm:px-5">
          {loading ? (
            <p className="text-center text-[#6C768B]">Loading quick links...</p>
          ) : links.length === 0 ? (
            <p className="text-center text-[#6C768B]">No quick links available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 font15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-10 quicklink">
              {columns.map((columnLinks, columnIndex) => (
                <ul
                  key={`quick-link-col-${columnIndex}`}
                  className="list-disc space-y-3 break-words sm:pl-5"
                >
                  {columnLinks.map((link) => (
                    <QuickLinkItem key={link.id} link={link} />
                  ))}
                </ul>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
