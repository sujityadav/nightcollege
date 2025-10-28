'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import Image from 'next/image';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';

export default function AddBanner() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id'); // read id from query

  const SideBarNavItems = [
    {
      label: 'Rebranding',
      href: '/admin/rebranding',
    },
    {
      label: 'Contact Information',
      href: '/admin/about-us/contact-info',
    },
    {
      label: 'Flash Screen Popup',
      href: '/admin/rebranding/home-popup',
    },
  ];

  // Fetch data if in update mode
  useEffect(() => {
    if (bannerId) {
      setIsUpdateMode(true);
      fetchBannerData(bannerId);
    }
  }, [bannerId]);

  const fetchBannerData = async (id) => {
    try {
      setLoading(true);
      
      const res = await axios.get(`/api/rebranding/getbyId`, {
        params: { id: id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const banner = res.data.data;
      console.log('Fetched banner data:', banner);
      reset({
        title:  banner?.RebrandingData?.data?.title,
        description: banner?.RebrandingData?.data?.description,
        sortNo: banner?.RebrandingData?.data?.sortNo,
      });
      setFromDate(new Date(banner?.RebrandingData?.data?.fromDate));
      setToDate(new Date(banner?.RebrandingData?.data?.toDate));
      setUploadedImage(banner?.RebrandingData?.data?.photo);
    } catch (err) {
      console.error('Failed to fetch banner:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch banner data',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setValue('photo', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setUploadedImage(null);
    setValue('photo', null);
  };

  const onSubmit = async (formData) => {
    formData.fromDate = fromDate;
    formData.toDate = toDate;

    const payload = {
      data: formData,
      ...(bannerId && { _id: bannerId }),
    };

    try {
      const url = bannerId ? `/api/rebranding/${bannerId}` : `/api/rebranding`;
      const method = bannerId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: 'success',
          summary: bannerId ? 'Updated' : 'Saved',
          detail: `Banner ${bannerId ? 'updated' : 'saved'} successfully ✅`,
          life: 3000,
        });
        router.push("/admin/rebranding");
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save banner',
        life: 3000,
      });
    }
  };

  return (
    <div className="grid grid-cols-12 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-7 items-start">
      <Toast ref={toast} />
      
      <div className='col-span-1'>
        <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
      </div>
     
      <div className='col-span-6'>
        <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
          <div className='mb-3'>
            <div className='flex justify-between'>
              <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>
                {isUpdateMode ? 'Update Banner' : 'Add Banner'}
              </h2>
              <Link href='/admin/rebranding' className='cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                Back
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
            <div className='px-[20px] lg:px-[100px] xl:px-[150px] 3xl:px-[13.021vw]'>
              <div className='space-y-3'>
                
                <div className='flex flex-col gap-1'>
                  <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Banner Title</label>
                  <InputText 
                    {...register('title', { required: true })} 
                    placeholder="Enter your title" 
                    className='border rounded-none' 
                  />
                  {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
                </div>

                <div className='flex flex-col gap-1'>
                  <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Banner Description</label>
                  <InputText 
                    {...register('description', { required: true })} 
                    placeholder="Enter your description" 
                    className='border rounded-none' 
                  />
                  {errors.description && <span className="text-red-500 text-sm">This field is required</span>}
                </div>

                <div className='flex flex-col gap-1'>
                  <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Sort No.</label>
                  <InputText 
                    type="number" 
                    {...register('sortNo', { required: true })} 
                    placeholder="Enter your sort number" 
                    className='border rounded-none' 
                  />
                  {errors.sortNo && <span className="text-red-500 text-sm">This field is required</span>}
                </div>

                <div className='flex gap-5'> 
                  <div className='flex flex-col gap-1 w-full'>
                    <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>From (Date)</label>
                    <Calendar 
                      value={fromDate} 
                      onChange={(e) => setFromDate(e.value)} 
                      className='w-full' 
                      showIcon 
                    />
                  </div>
                  <div className='flex flex-col gap-1 w-full'>
                    <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>To (Date)</label>
                    <Calendar 
                      value={toDate} 
                      onChange={(e) => setToDate(e.value)} 
                      className='w-full' 
                      showIcon 
                    />
                  </div>
                </div>
             
                <div className='flex flex-col gap-1'>
                  <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Photo Upload</label>
                  <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4 justify-center group relative cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="absolute left-0 right-0 top-0 bottom-0 opacity-0 cursor-pointer" 
                    />
                    <div className="text-center">
                      <Image src="/images/admin/svg/upload.svg" className="inline mb-3" width={40} height={40} alt='Upload' />
                      <p className="text-[#6C768B] xl:text-[0.730vw] mb-3">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[0.750rem] xl:text-[0.625vw] text-[#6C768B] font-semibold mb-4">Max. File Size: 30MB</p>
                      <button type="button" className="text-white text-[0.750rem] xl:text-[0.625vw] bg-[#4FB155] border border-[#4FB155] rounded xl:py-[0.417vw] py-2 xl:px-[0.417vw] px-2 inline-block group-hover:bg-[#3f8643] group-hover:border-[#3f8643] transition duration-300 ease-in-out">
                        <i className="rdmark-table-search mr-2"></i>
                        Browse File
                      </button>
                    </div>
                  </div>
                </div>

                {uploadedImage && (
                  <div className='p-2 border flex gap-5 items-center'>
                    <div>
                      <Image src={uploadedImage} className="inline mb-3" width={300} height={150} alt='Uploaded Banner' />
                    </div>
                    <div>
                      <button 
                        type="button"
                        onClick={handleRemovePhoto}
                        className='w-auto flex gap-2 items-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none'
                      >
                        <i className="pi pi-times-circle"></i> Remove Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className='mt-[30px]'>
                <div className='flex justify-center gap-6'>
                  <Link href='/admin/rebranding' className='cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                    Cancel
                  </Link>
                  <Button 
                    type='submit' 
                    className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised'
                    loading={loading}
                  > 
                    {isUpdateMode ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}