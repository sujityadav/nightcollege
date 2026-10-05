'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, {
  DEFAULT_MAX_MEDIA_SIZE_MB,
  uploadMediaFile,
} from '@/app/components/common/MediaUpload';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const STAFF_TYPE_OPTIONS = [
  { label: 'Teaching', value: 'Teaching' },
  { label: 'Non Teaching', value: 'Non Teaching' },
];

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

export default function AddStaff() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [joiningDate, setJoiningDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [staffType, setStaffType] = useState('');
  const [staffTypeError, setStaffTypeError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffId = searchParams.get('id');

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('details', value);
  };

  useEffect(() => {
    if (staffId) {
      setIsUpdateMode(true);
      fetchStaffData(staffId);
    }
  }, [staffId]);

  const fetchStaffData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/stafs/getbyId', {
        params: { id },
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const staff = res.data.data?.[0]?.StaffData?.data;
      reset({
        name: staff?.name,
        designation: staff?.designation,
        details: staff?.details || '',
      });
      setEditorContent(staff?.details || '');
      setValue('details', staff?.details || '');
      setJoiningDate(staff?.joiningDate ? new Date(staff.joiningDate) : null);
      setStaffType(staff?.staffType || '');
      setMediaPreview(staff?.photo || '');
      setMediaFile(null);
      setMediaError('');
      setStaffTypeError('');
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = ({ file, previewUrl }) => {
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaError('');
  };

  const handleMediaError = (message) => {
    setMediaError(message);
    toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
  };

  const onSubmit = async (formData) => {
    if (!staffType) {
      setStaffTypeError('Type is required');
      return;
    }
    setStaffTypeError('');

    if (!mediaPreview && !mediaFile) {
      setMediaError('Photo is required');
      return;
    }

    try {
      setLoading(true);
      const photoUrl = await uploadMediaFile(mediaFile, mediaPreview);
      if (!photoUrl) {
        setMediaError('Photo is required');
        setLoading(false);
        return;
      }

      const payload = {
        data: {
          ...formData,
          details: editorContent,
          joiningDate,
          staffType,
          photo: photoUrl,
        },
        ...(staffId && { _id: staffId }),
      };

      const url = staffId ? `/api/stafs/${staffId}` : '/api/stafs';
      const method = staffId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: 'success',
          summary: staffId ? 'Updated' : 'Saved',
          detail: `Staff ${staffId ? 'updated' : 'added'} successfully`,
          life: 3000,
        });
        router.push('/admin/all-staff');
      }
    } catch (err) {
      console.error('Failed to submit staff:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to save staff',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className="p-[20px] xl:p-[25px] w-full">
        <div className="flex justify-between mb-3">
          <h2 className="text-[#19212A] text-[22px] font-[700] m-0">
            {isUpdateMode ? 'Update Staff' : 'Add Staff'}
          </h2>
          <Link href="/admin/all-staff" className="cancelbtn px-4 py-2 leading-none">
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white card-shadow p-[25px]" noValidate>
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <InputText
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter staff name"
                className="border rounded-none"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Designation <span className="text-red-500">*</span>
              </label>
              <InputText
                {...register('designation', { required: 'Designation is required' })}
                placeholder="Enter designation"
                className="border rounded-none"
              />
              {errors.designation && (
                <span className="text-red-500 text-sm">{errors.designation.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Type <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={staffType}
                options={STAFF_TYPE_OPTIONS}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => {
                  setStaffType(e.value);
                  setStaffTypeError('');
                }}
                placeholder="Select type"
                className="w-full border rounded-none"
              />
              {staffTypeError && <span className="text-red-500 text-sm">{staffTypeError}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Details / Bio</label>
              <TextEditor
                value={editorContent}
                setEditorContent={setEditorContent}
                onChange={handleEditorChange}
              />
              <input type="hidden" {...register('details')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Joining Date</label>
              <Calendar value={joiningDate} onChange={(e) => setJoiningDate(e.value)} showIcon />
            </div>

            <MediaUpload
              required
              label="Photo"
              allowVideo={false}
              maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
              previewUrl={mediaPreview}
              file={mediaFile}
              mediaType="Photo"
              error={mediaError}
              onChange={handleMediaChange}
              onClear={handleMediaClear}
              onError={handleMediaError}
            />

            <div className="mt-6 flex justify-center gap-6">
              <Link href="/admin/all-staff" className="cancelbtn px-4 py-2">
                Cancel
              </Link>
              <Button
                type="submit"
                className="text-white bg-primarycolor border-[#af251c] px-4 py-2 rounded-none"
                loading={loading}
              >
                {isUpdateMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
