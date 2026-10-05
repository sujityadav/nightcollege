"use client";

import { useState } from 'react';
import SubBanner from '../features/sub-banner';
import DepartmentSidebar, { departmentMenuItems } from '../components/department-sidebar';

export default function Departments() {
  const [activeTab, setActiveTab] = useState('glance');
  const activeItem = departmentMenuItems.find((item) => item.id === activeTab);
  const breadcrumbData = [
    { label: "Home", url: "/" },
    { label: "Departments", url: "/departments" },
    { label: "Department of Marathi", url: "" },
  ];
  return (
    <>
      <SubBanner title="Department of Marathi" breadcrumbData={breadcrumbData} />
      <main className="mb-5">
        <div className="px300 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)] lg:gap-8">
          <DepartmentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <section className="min-w-0 rounded-lg bg-white p-5 shadow-[0_4px_18px_rgba(20,58,119,0.10)] sm:p-7 lg:p-9">
            {activeTab === 'glance' ? (
              <>
                <div className="title mb-7">
                  <h1 className="font26 font-[700] text-[#1B212F]">Department at a Glance</h1>
                </div>
                <div className="space-y-5 text-sm leading-7 text-[#4B586E] sm:text-[15px]">
                  <p>
                    The Department of Marathi is committed to nurturing language proficiency, literary appreciation,
                    and critical thinking among students. The department supports an inclusive learning environment
                    through classroom teaching, seminars, reading activities, and cultural programmes.
                  </p>
                  <p>
                    Our faculty members guide students in understanding Marathi literature, grammar, communication,
                    and contemporary writing. The department also encourages participation in academic and cultural
                    events that celebrate the richness of Marathi language and heritage.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[['Established', '1983'], ['Programmes', 'UG Courses'], ['Focus', 'Language & Literature']].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[#E7EDF7] bg-[#F8FAFE] p-4">
                      <p className="text-xs text-[#63799F]">{label}</p>
                      <p className="mt-1 font-semibold text-[#183B6D]">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="title mb-7"><h1 className="font26 font-[700] text-[#1B212F]">{activeItem?.label}</h1></div>
                <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
                  Content for {activeItem?.label} will be available here.
                </p>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
