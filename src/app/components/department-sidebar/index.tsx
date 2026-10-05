'use client';

export const departmentMenuItems = [
  { id: 'glance', label: 'Department at Glance', icon: 'pi pi-building-columns' },
  { id: 'profile', label: 'Department Profile', icon: 'pi pi-file' },
  { id: 'courses', label: 'Course Offered (COC/Add On)', icon: 'pi pi-graduation-cap' },
  { id: 'pos', label: 'POs and COs', icon: 'pi pi-check-circle' },
  { id: 'students', label: 'Student Strength', icon: 'pi pi-users' },
  { id: 'timetable', label: 'Departmental Time-table', icon: 'pi pi-calendar' },
  { id: 'academic-plan', label: 'Departmental Academic Plan', icon: 'pi pi-calendar-plus' },
  { id: 'syllabus', label: 'Syllabus', icon: 'pi pi-book' },
  { id: 'study-material', label: 'Study Material', icon: 'pi pi-file-pdf' },
  { id: 'result', label: 'Result', icon: 'pi pi-chart-bar' },
  { id: 'activities', label: 'Departmental Activities', icon: 'pi pi-users' },
  { id: 'mou', label: 'MOU & Collaborations', icon: 'pi pi-verified' },
  { id: 'publications', label: 'Research Publications', icon: 'pi pi-book' },
  { id: 'alumni', label: 'Alumni', icon: 'pi pi-users' },
  { id: 'placement', label: 'Placement', icon: 'pi pi-briefcase' },
  { id: 'awards', label: 'Awards / Rewards', icon: 'pi pi-trophy' },
  { id: 'videos', label: 'Blog / Videos', icon: 'pi pi-youtube' },
];

type DepartmentSidebarProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  departmentName?: string;
};

export default function DepartmentSidebar({
  activeTab,
  onTabChange,
  departmentName = 'Department of Marathi',
}: DepartmentSidebarProps) {
  return (
    <aside className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.12)]">
      <div className="flex items-center gap-3 bg-primarycolor px-4 py-3 text-white">
        <i className="pi pi-book text-lg" aria-hidden="true" />
        <h2 className="font-serif text-base font-bold">{departmentName}</h2>
      </div>
      <nav aria-label={`${departmentName} sections`} className="p-1.5">
        {departmentMenuItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-[12px] transition sm:text-[13px] ${
                isActive ? 'bg-primarycolor font-semibold text-white shadow-sm' : 'border-b border-[#E7EDF7] text-[#183B6D] hover:bg-[#FFF3F1] hover:text-primarycolor'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`${item.icon} w-4 text-center text-sm`} aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.label}</span>
              <i className="pi pi-angle-right text-xs" aria-hidden="true" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
