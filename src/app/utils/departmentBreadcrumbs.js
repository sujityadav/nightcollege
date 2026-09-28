import axios from 'axios';

export async function resolveDepartmentHierarchy({
  departmentId = null,
  subjectId = null,
  subPointId = null,
}) {
  let deptId = departmentId || null;
  let subjId = subjectId || null;
  const subPtId = subPointId || null;

  let departmentTitle = '';
  let subjectTitle = '';
  let subPointTitle = '';

  if (subPtId) {
    const subRes = await axios.get('/api/subdepartment/getbyId', { params: { id: subPtId } });
    const row = subRes.data?.data?.[0];
    subPointTitle = row?.SubDepartmentsData?.data?.title || '';
    subjId = subjId || row?.SubDepartmentsData?.data?.SubdepatmentId || null;
  }

  if (subjId) {
    const subjRes = await axios.get('/api/innerdepartments/getbyId', { params: { id: subjId } });
    const row = subjRes.data?.data?.[0];
    subjectTitle = row?.InnerDepartmentsData?.data?.title || '';
    deptId = deptId || row?.InnerDepartmentsData?.data?.depatmentId || null;
  }

  if (deptId) {
    const deptRes = await axios.get('/api/departments/getbyId', { params: { id: deptId } });
    departmentTitle = deptRes.data?.data?.[0]?.DepartmentsData?.data?.title || '';
  }

  return {
    ids: { deptId, subjId, subPtId },
    titles: { departmentTitle, subjectTitle, subPointTitle },
  };
}

export function buildDepartmentTrailBreadcrumbs({ ids, titles, tail = [] }) {
  const { deptId, subjId, subPtId } = ids;
  const { departmentTitle, subjectTitle, subPointTitle } = titles;

  const items = [{ label: 'All Departments', href: '/admin/all-departments' }];

  if (deptId && departmentTitle) {
    items.push({
      label: departmentTitle,
      href: `/admin/subjects?depatmentId=${deptId}`,
    });
  }

  if (subjId && subjectTitle) {
    const params = new URLSearchParams({ SubdepatmentId: subjId });
    if (deptId) params.set('depatmentId', deptId);
    items.push({
      label: subjectTitle,
      href: `/admin/sub-points?${params.toString()}`,
    });
  }

  if (subPtId && subPointTitle) {
    items.push({
      label: subPointTitle,
      href: `/admin/departmentalactivity?subDepartmentId=${subPtId}`,
    });
  }

  return [...items, ...tail];
}
