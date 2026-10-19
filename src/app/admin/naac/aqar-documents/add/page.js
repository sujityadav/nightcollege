'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

export default function AqarDocumentFormPage() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { sortOrder: '0' } });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const id = useSearchParams().get('id');
  const isEditMode = Boolean(id);

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update AQAR Document' : 'Add AQAR Document',
    breadcrumbs: [
      { label: 'NAAC', href: '/admin/naac?section=aqar-documents' },
      { label: 'AQAR - Documents Link', href: '/admin/naac?section=aqar-documents' },
      { label: isEditMode ? 'Update' : 'Add', isCurrent: true },
    ],
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await axios.get(`/api/naac-aqar-documents/${id}`);
        const item = res.data.data;
        reset({
          title: item.title || '',
          sortOrder: String(item.sortOrder ?? 0),
        });
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load document',
          life: 3000,
        });
      }
    };
    load();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: '',
        sortOrder: Number.parseInt(String(formData.sortOrder), 10),
      };
      const response = await axios[isEditMode ? 'put' : 'post'](
        isEditMode ? `/api/naac-aqar-documents/${id}` : '/api/naac-aqar-documents',
        payload
      );
      if (!response.data.success) throw new Error(response.data.message);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Document ${isEditMode ? 'updated' : 'saved'}`,
        life: 2500,
      });
      router.push('/admin/naac?section=aqar-documents');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || error.message || 'Could not save',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <form onSubmit={handleSubmit(onSubmit)} className="card-shadow bg-white p-[25px]" noValidate>
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              className="rounded-none border"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title?.message && (
              <span className="text-sm text-red-500">{errors.title.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Sort Order <span className="text-red-500">*</span>
            </label>
            <Controller
              name="sortOrder"
              control={control}
              rules={{
                required: 'Sort order is required',
                validate: (value) => {
                  const num = Number(value);
                  if (Number.isNaN(num) || num < 0) {
                    return 'Sort order cannot be negative';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <InputText
                  {...field}
                  type="number"
                  min="0"
                  className="rounded-none border"
                  placeholder="Enter sort order"
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            {errors.sortOrder?.message && (
              <span className="text-sm text-red-500">{errors.sortOrder.message}</span>
            )}
          </div>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="/admin/naac?section=aqar-documents" className="cancelbtn px-4 py-2 leading-none">
              Cancel
            </Link>
            <Button
              type="submit"
              loading={loading}
              className="rounded-none border border-[#af251c] bg-primarycolor px-4 py-2 text-white"
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
