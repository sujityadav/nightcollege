'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

const yearFromDate = (year) => (year ? new Date(year, 0, 1) : null);

const dateToYear = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.getFullYear();
  return null;
};

export default function AddMasterYearPage() {
  const [fromYear, setFromYear] = useState(null);
  const [toYear, setToYear] = useState(null);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [existingYears, setExistingYears] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const id = useSearchParams().get('id');
  const isEditMode = Boolean(id);

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Year' : 'Add Year',
    breadcrumbs: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Masters', href: '/admin/settings/masters' },
      { label: 'Years', href: '/admin/settings/masters/years' },
      { label: isEditMode ? 'Update Year' : 'Add Year', isCurrent: true },
    ],
  });

  useEffect(() => {
    const loadExistingYears = async () => {
      try {
        const res = await axios.get('/api/master-years', { params: { page: 1, limit: 500 } });
        setExistingYears(res.data.data || []);
      } catch {
        setExistingYears([]);
      }
    };
    loadExistingYears();
  }, []);

  useEffect(() => {
    if (!id) return;
    const loadYear = async () => {
      try {
        const res = await axios.get(`/api/master-years/${id}`);
        const item = res.data.data;
        setFromYear(yearFromDate(item.fromYear));
        setToYear(yearFromDate(item.toYear));
        setStatus(Boolean(item.status));
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load year',
          life: 3000,
        });
      }
    };
    loadYear();
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    const from = dateToYear(fromYear);
    const to = dateToYear(toYear);

    if (!from || !to) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'From year and to year are required',
        life: 3000,
      });
      return;
    }

    if (from >= to) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'From year must be less than to year',
        life: 3000,
      });
      return;
    }

    const isDuplicate = existingYears.some(
      (year) => year.fromYear === from && year.toYear === to && year._id !== id
    );
    if (isDuplicate) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'This year range already exists',
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { fromYear: from, toYear: to, status };
      const response = await axios[isEditMode ? 'put' : 'post'](
        isEditMode ? `/api/master-years/${id}` : '/api/master-years',
        payload
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Save failed');
      }
      router.push('/admin/settings/masters/years');
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Could not save year',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0 flex-1 p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
        <div className="flex justify-between mb-3">
          <h2 className="text-[22px] font-[700] m-0">{isEditMode ? 'Update' : 'Add'} Year</h2>
          <Link href="/admin/settings/masters/years" className="cancelbtn px-4 py-2 leading-none">
            Back
          </Link>
        </div>
        <form onSubmit={submit} className="bg-white card-shadow p-[25px]" noValidate>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-1 flex-1">
                <label className={fieldLabelClass}>
                  From Year <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={fromYear}
                  onChange={(e) => setFromYear(e.value)}
                  view="year"
                  dateFormat="yy"
                  showIcon
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className={fieldLabelClass}>
                  To Year <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={toYear}
                  onChange={(e) => setToYear(e.value)}
                  view="year"
                  dateFormat="yy"
                  showIcon
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={fieldLabelClass}>Status</label>
              <div className="flex items-center gap-3">
                <InputSwitch checked={status} onChange={(e) => setStatus(e.value)} />
                <span className="text-sm text-[#64748b]">{status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="mt-[30px] flex justify-center gap-6">
              <Link
                href="/admin/settings/masters/years"
                className="cancelbtn px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%]"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                loading={loading}
                className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%] rounded-none p-button-raised"
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
    </div>
  );
}
