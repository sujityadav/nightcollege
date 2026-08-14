'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import TextEditor from '@/app/components/common/editor';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';

export default function AnnouncementForm() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [description, setDescription] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const id = useSearchParams().get('id');

  useEffect(() => {
    if (!id) return;
    const loadAnnouncement = async () => {
      try {
        const res = await axios.get(`/api/announcements/${id}`);
        const item = res.data.data;
        reset({ sortNo: item.sortNo, title: item.title, description: item.description });
        setDescription(item.description);
        setFromDate(item.fromDate ? new Date(item.fromDate) : null);
        setToDate(item.toDate ? new Date(item.toDate) : null);
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load announcement', life: 3000 });
      }
    };
    loadAnnouncement();
  }, [id, reset]);

  const submit = async (formData) => {
    const dateValidationError = validateDateRange(fromDate, toDate, { requireBoth: true });
    if (dateValidationError) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: dateValidationError, life: 3000 });
      return;
    }

    setLoading(true);
    try {
      await axios[id ? 'put' : 'post'](id ? `/api/announcements/${id}` : '/api/announcements', {
        sortNo: Number(formData.sortNo),
        title: formData.title,
        description,
        fromDate,
        toDate,
      });
      router.push('/admin/announcements');
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not save announcement', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fieldLabelClass = 'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

  return (
    <div className="p-[20px] xl:p-[25px] w-full">
      <Toast ref={toast} />
      <div className="flex justify-between mb-3">
        <h2 className="text-[22px] font-[700] m-0">{id ? 'Update' : 'Add'} Announcement</h2>
        <Link href="/admin/announcements" className="cancelbtn px-4 py-2 leading-none">Back</Link>
      </div>
      <form onSubmit={handleSubmit(submit)} className="bg-white card-shadow p-[25px]" noValidate>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>Sort Number <span className="text-red-500">*</span></label>
            <InputText type="number" min="0" className="border rounded-none" {...register('sortNo', { required: 'Sort number is required', min: { value: 0, message: 'Sort number cannot be negative' } })} />
            {errors.sortNo?.message && <span className="text-red-500 text-sm">{errors.sortNo.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>Title <span className="text-red-500">*</span></label>
            <InputText className="border rounded-none" {...register('title', { required: 'Title is required' })} />
            {errors.title?.message && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>Description <span className="text-red-500">*</span></label>
            <TextEditor value={description} setEditorContent={setDescription} onChange={(value) => { setDescription(value); setValue('description', value); }} />
            <input type="hidden" {...register('description', { required: 'Description is required' })} />
            {errors.description?.message && <span className="text-red-500 text-sm">{errors.description.message}</span>}
          </div>
          <DateRange fromDate={fromDate} toDate={toDate} onFromDateChange={setFromDate} onToDateChange={setToDate} required />
          <div className="mt-[30px] flex justify-center gap-6">
            <Link href="/admin/announcements" className="cancelbtn px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%]">Cancel</Link>
            <Button type="submit" loading={loading} className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%] rounded-none p-button-raised">{id ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
