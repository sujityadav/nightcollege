"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import SubBanner from '../features/sub-banner';
import DepartmentSidebar, { type DepartmentNavItem } from '../components/department-sidebar';
import DepartmentActivitiesGrid from '../features/departments/DepartmentActivitiesGrid';
import 'suneditor/dist/css/suneditor.min.css';

const ACTIVITIES_TAB_ID = 'departmental-activities';

type ContentSubPoint = {
  id: string;
  title: string;
  icon: string;
  smallDescription: string;
  description: string;
};

type SubjectPayload = {
  departmentId: string;
  subject: {
    id: string;
    title: string;
    smallDescription: string;
    description: string;
  };
  subPoints: ContentSubPoint[];
  hasDepartmentalActivities: boolean;
};

export default function Departments() {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const subjectId = searchParams.get('subjectId');

  const [loading, setLoading] = useState(Boolean(subjectId));
  const [error, setError] = useState('');
  const [subjectPayload, setSubjectPayload] = useState<SubjectPayload | null>(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (!subjectId) {
      setSubjectPayload(null);
      setLoading(false);
      setError('');
      setActiveTab('');
      return;
    }

    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/departments/public/subject', {
          params: {
            subjectId,
            ...(departmentId ? { departmentId } : {}),
          },
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to load department page');
        }

        setSubjectPayload(response.data.data);
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load department page';
        setError(message);
        setSubjectPayload(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [departmentId, subjectId]);

  const navItems: DepartmentNavItem[] = useMemo(() => {
    if (!subjectPayload) return [];

    const items: DepartmentNavItem[] = subjectPayload.subPoints.map((subPoint) => ({
      id: subPoint.id,
      label: subPoint.title,
      icon: subPoint.icon || 'pi pi-file',
    }));

    if (subjectPayload.hasDepartmentalActivities) {
      items.push({
        id: ACTIVITIES_TAB_ID,
        label: 'Departmental Activities',
        icon: 'pi pi-users',
      });
    }

    return items;
  }, [subjectPayload]);

  useEffect(() => {
    if (!navItems.length) {
      setActiveTab('');
      return;
    }

    if (!navItems.some((item) => item.id === activeTab)) {
      setActiveTab(navItems[0].id);
    }
  }, [navItems, activeTab]);

  const departmentTitle = subjectPayload?.subject?.title
    ? `Department of ${subjectPayload.subject.title}`
    : 'Departments';

  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: 'Departments', url: '/departments' },
    ...(subjectPayload?.subject?.title
      ? [{ label: departmentTitle, url: '' }]
      : []),
  ];

  const activeSubPoint = subjectPayload?.subPoints.find((item) => item.id === activeTab);
  const isActivitiesView = activeTab === ACTIVITIES_TAB_ID;

  const renderMainContent = () => {
    if (!subjectId) {
      return (
        <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
          Select a subject from the Departments menu to view department details.
        </p>
      );
    }

    if (loading) {
      return <p className="text-sm text-[#4B586E]">Loading department information…</p>;
    }

    if (error) {
      return <p className="text-sm text-red-600">{error}</p>;
    }

    if (!navItems.length) {
      return (
        <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
          No content has been added for this subject yet.
        </p>
      );
    }

    if (isActivitiesView) {
      return (
        <DepartmentActivitiesGrid
          subjectId={subjectId}
          departmentId={departmentId}
        />
      );
    }

    if (!activeSubPoint) {
      return null;
    }

    return (
      <>
        <div className="title mb-7">
          <h1 className="font26 font-[700] text-[#1B212F]">{activeSubPoint.title}</h1>
        </div>
        {activeSubPoint.description ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: activeSubPoint.description }}
          />
        ) : (
          <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
            No description has been added for this section yet.
          </p>
        )}
      </>
    );
  };

  return (
    <>
      <SubBanner
        title={departmentTitle}
        subtitle={subjectPayload?.subject?.smallDescription || ''}
        breadcrumbData={breadcrumbData}
      />
      <main className="mb-5">
        <div
          className={`px300 gap-6 lg:gap-8 ${
            isActivitiesView
              ? 'flex flex-col lg:flex-row lg:items-start'
              : 'grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]'
          }`}
        >
          {subjectId && navItems.length > 0 ? (
            <div className={isActivitiesView ? 'w-full shrink-0 lg:w-[280px] xl:w-[310px]' : undefined}>
              <DepartmentSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                departmentName={departmentTitle}
                items={navItems}
              />
            </div>
          ) : null}
          <section className="min-w-0 w-full flex-1 rounded-lg bg-white p-5 shadow-[0_4px_18px_rgba(20,58,119,0.10)] sm:p-7 lg:p-9">
            {renderMainContent()}
          </section>
        </div>
      </main>
    </>
  );
}
