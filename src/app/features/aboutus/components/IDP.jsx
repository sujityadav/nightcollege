'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor/index';
import { useAboutEditor } from '../hooks/useAboutEditor';

const IDP = () => {
  const {
    editorContent,
    handleEditorChange,
    handleSave,
    isLoading,
    toast
  } = useAboutEditor("idp");

  return (
    <div className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
      <Toast ref={toast} />
      <div className='px-[20px] xl:px-[250px] 3xl:px-[13.021vw]'>
        <div className='space-y-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-[#212325] text-[14px] font-[500]'>Title</label>
            <InputText type='text' placeholder='Enter your title' className='rounded-none' />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-[#212325] text-[14px] font-[500]'>Description</label>
            <TextEditor value={editorContent} onChange={handleEditorChange} />
          </div>
        </div>

        <div className='mt-[30px]'>
          <div className='flex justify-center gap-6'>
            <Link href='' className='cancelbtn px-[14px] py-[10px]'>Cancel</Link>
            <Button
              onClick={()=>handleSave("idp")}
              loading={isLoading}
              className='text-white border bg-primarycolor border-[#af251c] px-[14px] py-[10px] leading-[100%] rounded-none p-button-raised'
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDP;
