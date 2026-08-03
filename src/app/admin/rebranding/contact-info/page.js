'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import axios from 'axios';
import { useSelector } from 'react-redux';

const GOOGLE_MAPS_PATTERN =
  /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|goo\.gl\/maps|maps\.app\.goo\.gl)(\/|\?|#|$)/i;

function validateGoogleLocation(value) {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return 'Google Location is required';
  }

  if (/\s/.test(trimmed)) {
    return 'Google Location should not contain spaces. Paste the full Google Maps link.';
  }

  let urlToCheck = trimmed;
  if (!/^https?:\/\//i.test(urlToCheck)) {
    urlToCheck = `https://${urlToCheck}`;
  }

  try {
    new URL(urlToCheck);
  } catch {
    return 'Please enter a valid URL';
  }

  if (!GOOGLE_MAPS_PATTERN.test(trimmed)) {
    return 'Please enter a valid Google Maps link (e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/...)';
  }

  return '';
}

export default function ContactInfoPage() {
  const [googleLocation, setGoogleLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const SideBarNavItems = [
    {
      label: 'Rebranding',
      href: '/admin/rebranding',
    },
    {
      label: 'Contact Information',
      href: '/admin/rebranding/contact-info',
    },
    {
      label: 'Flash Screen Popup',
      href: '/admin/rebranding/home-popup',
    },
  ];

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contact-info', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = response.data?.data?.ContactInfoData?.data;
      if (data) {
        setGoogleLocation(data.googleLocation || '');
        setContactInfo(data.contactInfo || '');
        setLocationError('');
      }
    } catch (error) {
      console.error('Failed to load contact info:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load contact information',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setGoogleLocation(value);
    if (locationError) {
      setLocationError(validateGoogleLocation(value));
    }
  };

  const handleLocationBlur = () => {
    setLocationError(validateGoogleLocation(googleLocation));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const error = validateGoogleLocation(googleLocation);
    setLocationError(error);
    if (error) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: error,
        life: 3000,
      });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        '/api/contact-info',
        {
          data: {
            googleLocation: googleLocation.trim(),
            contactInfo,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to save');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Saved',
        detail: 'Contact information saved successfully',
        life: 2500,
      });
    } catch (error) {
      console.error('Failed to save contact info:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || error.message || 'Failed to save contact information',
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 items-start">
      <Toast ref={toast} />
      <div className="shrink-0">
        <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
      </div>

      <div className="min-w-0 flex-1 p-[20px] xl:p-[25px] 3xl:p-[1.563vw]">
        <div className="mb-3">
          <div className="flex justify-between">
            <h2 className="text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0">
              Contact Information
            </h2>
            <Link
              href="/admin/rebranding"
              className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]"
            >
              Back
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]"
          noValidate
        >
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">
                Google Location <span className="text-red-500">*</span>
              </label>
              <InputText
                type="url"
                value={googleLocation}
                onChange={handleLocationChange}
                onBlur={handleLocationBlur}
                placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/...)"
                className={`border rounded-none ${locationError ? 'p-invalid border-red-500' : ''}`}
                disabled={loading}
                aria-invalid={Boolean(locationError)}
                aria-describedby="google-location-error"
              />
              {locationError ? (
                <span id="google-location-error" className="text-red-500 text-sm">
                  {locationError}
                </span>
              ) : (
                <span className="text-[#6C768B] text-xs">
                  Use a Google Maps share link from maps.google.com / maps.app.goo.gl
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">
                Contact Info
              </label>
              <TextEditor
                value={contactInfo}
                onChange={setContactInfo}
              />
            </div>

            <div className="mt-[30px]">
              <div className="flex justify-center gap-6">
                <Link
                  href="/admin/rebranding"
                  className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  loading={saving}
                  disabled={loading}
                  className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
