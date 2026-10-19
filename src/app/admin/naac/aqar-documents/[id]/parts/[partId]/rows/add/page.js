'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import Image from 'next/image';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import { isUnassignedSectionName } from '@/app/features/naac/constants/aqarDocument';
import { uploadDocumentFile, DEFAULT_MAX_MEDIA_SIZE_MB } from '@/app/components/common/MediaUpload';
import {
  canViewAqarRowDocumentOnSite,
  getAqarRowDocumentViewPath,
} from '@/app/utils/aqarRowDocument';

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

export default function AqarDocumentRowFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = params?.id;
  const partId = params?.partId;
  const rowId = searchParams.get('rowId');
  const isEditMode = Boolean(rowId);

  const [documentTitle, setDocumentTitle] = useState('');
  const [partTitle, setPartTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState('');
  const [sectionSortOrder, setSectionSortOrder] = useState('');
  const [srNo, setSrNo] = useState('');
  const [details, setDetails] = useState('');
  const [link, setLink] = useState('');
  const [linkType, setLinkType] = useState('link');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [removedDocumentUrl, setRemovedDocumentUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameSectionName, setRenameSectionName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [addSectionDialogVisible, setAddSectionDialogVisible] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionSortOrder, setNewSectionSortOrder] = useState('');
  const [addSectionSaving, setAddSectionSaving] = useState(false);
  const toast = useRef(null);
  const router = useRouter();

  const selectableSections = useMemo(
    () =>
      sections
        .filter((section) => !isUnassignedSectionName(section.name))
        .sort(
          (a, b) =>
            (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
            new Date(a.createdAt) - new Date(b.createdAt)
        )
        .map((section) => ({ ...section, _id: String(section._id) })),
    [sections]
  );

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Details' : 'Add Details',
    breadcrumbs: [
      { label: 'NAAC', href: '/admin/naac?section=aqar-documents' },
      { label: 'AQAR - Documents Link', href: '/admin/naac?section=aqar-documents' },
      {
        label: documentTitle || 'Parts',
        href: documentId ? `/admin/naac/aqar-documents/${documentId}` : '/admin/naac?section=aqar-documents',
      },
      {
        label: partTitle || 'Index',
        href:
          documentId && partId
            ? `/admin/naac/aqar-documents/${documentId}/parts/${partId}`
            : '/admin/naac?section=aqar-documents',
      },
      { label: isEditMode ? 'Update Details' : 'Add Details', isCurrent: true },
    ],
  });

  const loadSections = async () => {
    const response = await axios.get(`/api/naac-aqar-documents/${documentId}/sections`, {
      params: { partId },
    });
    const list = response.data.data || [];
    setSections(list);
    return list;
  };

  const applySectionSelection = (id, list = sections) => {
    setSectionId(id ? String(id) : '');
    if (!id) {
      setSectionSortOrder('');
      return;
    }
    const match = list.find((s) => String(s._id) === String(id));
    if (match) {
      setSectionSortOrder(String(match.sortOrder ?? ''));
    }
  };

  useEffect(() => {
    if (!documentId || !partId) return;

    const load = async () => {
      try {
        const docRes = await axios.get(`/api/naac-aqar-documents/${documentId}`);
        setDocumentTitle(docRes.data.data?.title || '');
        const partRes = await axios.get(`/api/naac-aqar-documents/${documentId}/parts/${partId}`);
        setPartTitle(partRes.data.data?.title || '');
        const sectionList = await loadSections();

        if (rowId) {
          const rowRes = await axios.get(`/api/naac-aqar-documents/${documentId}/rows/${rowId}`);
          const row = rowRes.data.data;
          const rowSection = sectionList.find((s) => String(s._id) === String(row.sectionId));
          if (rowSection && !isUnassignedSectionName(rowSection.name)) {
            applySectionSelection(row.sectionId, sectionList);
          } else {
            applySectionSelection('', sectionList);
          }
          setSrNo(row.srNo || '');
          setDetails(row.details || '');
          setLinkType(row.linkType === 'document' ? 'document' : 'link');
          setLink(row.link || '');
          setDocumentUrl(row.documentUrl || '');
          setDocumentName(row.documentName || '');
          setDocumentFile(null);
          setRemovedDocumentUrl('');
        }
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load data',
          life: 3000,
        });
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, partId, rowId]);

  const syncSectionSortOrderIfNeeded = async () => {
    if (!sectionId || sectionSortOrder === '') return;
    const sortOrder = Number(sectionSortOrder);
    if (Number.isNaN(sortOrder) || sortOrder < 0) return;

    const match = sections.find((s) => String(s._id) === sectionId);
    if (!match || match.sortOrder === sortOrder) return;

    await axios.put(`/api/naac-aqar-documents/${documentId}/sections/${sectionId}`, {
      name: match.name,
      sortOrder,
    });
    await loadSections();
  };

  const openAddSection = () => {
    setNewSectionName('');
    setNewSectionSortOrder('');
    setAddSectionDialogVisible(true);
  };

  const saveAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Section name is required',
        life: 3000,
      });
      return;
    }
    if (isUnassignedSectionName(name)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Unassigned is a system section name and cannot be used',
        life: 3000,
      });
      return;
    }

    setAddSectionSaving(true);
    try {
      const sortOrder =
        newSectionSortOrder === '' ? undefined : Number(newSectionSortOrder);
      const response = await axios.post(`/api/naac-aqar-documents/${documentId}/sections`, {
        partId,
        name,
        ...(sortOrder !== undefined && !Number.isNaN(sortOrder) ? { sortOrder } : {}),
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Could not add section');
      }
      const created = response.data.data;
      const list = await loadSections();
      const createdId = String(created._id);
      const inList = list.some((s) => String(s._id) === createdId);
      if (!inList) {
        setSections((prev) => [...prev, created]);
        applySectionSelection(createdId, [...list, created]);
      } else {
        applySectionSelection(createdId, list);
      }
      setAddSectionDialogVisible(false);
      toast.current?.show({
        severity: 'success',
        summary: 'Added',
        detail: 'Section created',
        life: 2500,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not add section',
        life: 3000,
      });
    } finally {
      setAddSectionSaving(false);
    }
  };

  const openRenameSection = () => {
    if (!sectionId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Select a section to rename',
        life: 3000,
      });
      return;
    }
    const current = sections.find((s) => String(s._id) === sectionId);
    if (!current || isUnassignedSectionName(current.name)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'This section cannot be renamed',
        life: 3000,
      });
      return;
    }
    setRenameSectionName(current.name);
    setRenameDialogVisible(true);
  };

  const saveRenameSection = async () => {
    const name = renameSectionName.trim();
    if (!name) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Section name is required',
        life: 3000,
      });
      return;
    }
    if (isUnassignedSectionName(name)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Unassigned is a system section name and cannot be used',
        life: 3000,
      });
      return;
    }

    setRenameSaving(true);
    try {
      const sortOrder =
        sectionSortOrder === '' ? undefined : Number(sectionSortOrder);
      const response = await axios.put(
        `/api/naac-aqar-documents/${documentId}/sections/${sectionId}`,
        {
          name,
          ...(sortOrder !== undefined && !Number.isNaN(sortOrder) ? { sortOrder } : {}),
        }
      );
      if (!response.data.success) throw new Error(response.data.message);

      await loadSections();
      setRenameDialogVisible(false);
      toast.current?.show({
        severity: 'success',
        summary: 'Renamed',
        detail: 'Section updated successfully',
        life: 2500,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not rename section',
        life: 3000,
      });
    } finally {
      setRenameSaving(false);
    }
  };

  const confirmDeleteSection = () => {
    if (!sectionId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'Select a section to delete',
        life: 3000,
      });
      return;
    }
    const current = sections.find((s) => String(s._id) === sectionId);
    if (current && isUnassignedSectionName(current.name)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'The Unassigned section cannot be deleted',
        life: 3000,
      });
      return;
    }

    confirmDialog({
      header: 'Delete Section',
      message: `Delete section "${current?.name}"? Its rows will move to Unassigned.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`/api/naac-aqar-documents/${documentId}/sections/${sectionId}`);
          applySectionSelection('');
          await loadSections();
          toast.current?.show({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Section deleted. Rows moved to Unassigned.',
            life: 3000,
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Could not delete section',
            life: 3000,
          });
        }
      },
    });
  };

  const validate = () => {
    const next = {};
    if (!sectionId) next.sectionId = 'Section is required';
    const selected = sections.find((s) => String(s._id) === sectionId);
    if (selected && isUnassignedSectionName(selected.name)) {
      next.sectionId = 'Please choose a section other than Unassigned';
    }
    if (sectionSortOrder !== '' && (Number.isNaN(Number(sectionSortOrder)) || Number(sectionSortOrder) < 0)) {
      next.sectionSortOrder = 'Sort order cannot be negative';
    }
    if (!String(srNo).trim()) next.srNo = 'Sr. no. is required';
    if (!String(details).trim()) next.details = 'Details is required';
    if (linkType === 'link') {
      if (!String(link).trim()) {
        next.link = 'Link is required';
      } else {
        try {
          const parsed = new URL(link.trim());
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            next.link = 'Link should be a valid URL';
          }
        } catch {
          next.link = 'Link should be a valid URL';
        }
      }
    } else if (!documentFile && !documentUrl) {
      next.document = 'Document is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleDocumentSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024) {
      const message = `File size must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`;
      setErrors((prev) => ({ ...prev, document: message }));
      toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
      return;
    }

    setDocumentFile(file);
    setDocumentName(file.name);
    setDocumentUrl('');
    setRemovedDocumentUrl('');
    setErrors((prev) => ({ ...prev, document: '' }));
  };

  const handleDocumentDelete = () => {
    if (documentUrl && !documentFile) {
      setRemovedDocumentUrl(documentUrl);
    }
    setDocumentFile(null);
    setDocumentUrl('');
    setDocumentName('');
    setErrors((prev) => ({ ...prev, document: '' }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await syncSectionSortOrderIfNeeded();

      let uploadedDocumentUrl = documentUrl;
      let uploadedDocumentName = documentName;

      if (linkType === 'document' && documentFile) {
        uploadedDocumentUrl = await uploadDocumentFile(documentFile, documentUrl);
        uploadedDocumentName = documentFile.name;
      }

      if (removedDocumentUrl && removedDocumentUrl !== uploadedDocumentUrl) {
        try {
          await axios.delete('/api/upload', { data: { url: removedDocumentUrl } });
        } catch (cleanupError) {
          console.warn('Old document cleanup warning:', cleanupError);
        }
      }

      const payload = {
        sectionId,
        srNo: srNo.trim(),
        details: details.trim(),
        linkType,
        link: linkType === 'link' ? link.trim() : '',
        documentUrl: linkType === 'document' ? uploadedDocumentUrl : '',
        documentName: linkType === 'document' ? uploadedDocumentName : '',
      };
      const response = await axios[isEditMode ? 'put' : 'post'](
        isEditMode
          ? `/api/naac-aqar-documents/${documentId}/rows/${rowId}`
          : `/api/naac-aqar-documents/${documentId}/rows`,
        payload
      );
      if (!response.data.success) throw new Error(response.data.message);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Details ${isEditMode ? 'updated' : 'saved'}`,
        life: 2500,
      });
      router.push(`/admin/naac/aqar-documents/${documentId}/parts/${partId}`);
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

  const hasSectionSelected = Boolean(sectionId);

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Dialog
        header="Add section"
        visible={addSectionDialogVisible}
        style={{ width: '420px' }}
        onHide={() => setAddSectionDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              label="Cancel"
              className="cancelbtn rounded-none px-4 py-2 text-[#3C4146]"
              onClick={() => setAddSectionDialogVisible(false)}
            />
            <Button
              type="button"
              label="Save"
              loading={addSectionSaving}
              className="rounded-none border border-[#af251c] bg-primarycolor text-white"
              onClick={saveAddSection}
            />
          </div>
        }
      >
        <div className="space-y-3">
          <InputText
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Section name"
            className="w-full rounded-none border"
          />
          <InputText
            type="number"
            min="0"
            value={newSectionSortOrder}
            onChange={(e) => setNewSectionSortOrder(e.target.value)}
            placeholder="Sort order (optional)"
            className="w-full rounded-none border"
          />
        </div>
      </Dialog>

      <Dialog
        header="Rename section"
        visible={renameDialogVisible}
        style={{ width: '420px' }}
        onHide={() => setRenameDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              label="Cancel"
              className="cancelbtn rounded-none px-4 py-2 text-[#3C4146]"
              onClick={() => setRenameDialogVisible(false)}
            />
            <Button
              type="button"
              label="Save"
              loading={renameSaving}
              className="rounded-none border border-[#af251c] bg-primarycolor text-white"
              onClick={saveRenameSection}
            />
          </div>
        }
      >
        <InputText
          value={renameSectionName}
          onChange={(e) => setRenameSectionName(e.target.value)}
          placeholder="Section name"
          className="w-full rounded-none border"
        />
      </Dialog>

      <form onSubmit={onSubmit} className="card-shadow bg-white p-[25px]" noValidate>
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Section <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Dropdown
                value={sectionId || null}
                options={selectableSections}
                optionLabel="name"
                optionValue="_id"
                onChange={(e) => {
                  applySectionSelection(e.value);
                  setErrors((prev) => ({ ...prev, sectionId: '' }));
                }}
                placeholder="Select section"
                filter
                filterPlaceholder="Search sections"
                showClear
                emptyMessage="No sections yet — use Add section"
                className="min-w-[220px] flex-1 rounded-none border"
                panelClassName="rounded-none"
              />
              <Button
                type="button"
                size="small"
                label="Add section"
                className="rounded-none border border-[#af251c] bg-white px-2 py-1 text-xs leading-tight text-primarycolor"
                onClick={openAddSection}
              />
              <Button
                type="button"
                size="small"
                label="Rename"
                className="rounded-none border border-[#af251c] bg-white px-2 py-1 text-xs leading-tight text-primarycolor"
                onClick={openRenameSection}
                disabled={!sectionId}
              />
              <Button
                type="button"
                size="small"
                label="Delete"
                className="rounded-none border border-red-500 bg-white px-2 py-1 text-xs leading-tight text-red-500"
                onClick={confirmDeleteSection}
                disabled={!sectionId}
              />
            </div>
            <p className="text-xs text-[#6C768B]">
              All sections for this part are listed in the dropdown.
            </p>
            {errors.sectionId && <span className="text-sm text-red-500">{errors.sectionId}</span>}
          </div>

          {hasSectionSelected ? (
            <>
              <div className="flex flex-col gap-1">
                <label className={fieldLabelClass}>Section sort order</label>
                <InputText
                  type="number"
                  min="0"
                  value={sectionSortOrder}
                  onChange={(e) => {
                    setSectionSortOrder(e.target.value);
                    setErrors((prev) => ({ ...prev, sectionSortOrder: '' }));
                  }}
                  placeholder="Lower numbers appear first in the table"
                  className="rounded-none border"
                />
                {errors.sectionSortOrder && (
                  <span className="text-sm text-red-500">{errors.sectionSortOrder}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={fieldLabelClass}>
                  Sr. no. <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={srNo}
                  onChange={(e) => {
                    setSrNo(e.target.value);
                    setErrors((prev) => ({ ...prev, srNo: '' }));
                  }}
                  className="rounded-none border"
                />
                {errors.srNo && <span className="text-sm text-red-500">{errors.srNo}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className={fieldLabelClass}>
                  Details <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  rows={5}
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    setErrors((prev) => ({ ...prev, details: '' }));
                  }}
                  className="w-full rounded-none border"
                />
                {errors.details && <span className="text-sm text-red-500">{errors.details}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className={fieldLabelClass}>
                  Attachment <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <RadioButton
                      inputId="aqar-link-type-link"
                      name="linkType"
                      value="link"
                      onChange={(e) => {
                        setLinkType(e.value);
                        setErrors((prev) => ({ ...prev, link: '', document: '' }));
                      }}
                      checked={linkType === 'link'}
                    />
                    <label htmlFor="aqar-link-type-link" className="cursor-pointer">Link</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioButton
                      inputId="aqar-link-type-document"
                      name="linkType"
                      value="document"
                      onChange={(e) => {
                        setLinkType(e.value);
                        setErrors((prev) => ({ ...prev, link: '', document: '' }));
                      }}
                      checked={linkType === 'document'}
                    />
                    <label htmlFor="aqar-link-type-document" className="cursor-pointer">Document</label>
                  </div>
                </div>
              </div>
              {linkType === 'link' ? (
                <div className="flex flex-col gap-1">
                  <label className={fieldLabelClass}>
                    Link <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      setErrors((prev) => ({ ...prev, link: '' }));
                    }}
                    placeholder="https://example.com"
                    className="rounded-none border"
                  />
                  {errors.link && <span className="text-sm text-red-500">{errors.link}</span>}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className={fieldLabelClass}>
                    Document upload <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative flex cursor-pointer justify-center border-2 border-dashed border-[#b9d1ffab] bg-[#fffef5] p-4">
                    <input
                      type="file"
                      onChange={handleDocumentSelect}
                      accept=".pdf,image/*"
                      className="absolute bottom-0 left-0 right-0 top-0 cursor-pointer opacity-0"
                    />
                    <div className="text-center">
                      <Image
                        src="/images/admin/svg/upload.svg"
                        className="mb-3 inline"
                        width={40}
                        height={40}
                        alt="Upload"
                      />
                      <p className="mb-3 text-[#6C768B]">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="mb-4 text-[0.750rem] font-semibold text-[#6C768B]">
                        PDF or image · Max. {DEFAULT_MAX_MEDIA_SIZE_MB}MB
                      </p>
                    </div>
                  </div>
                  {(documentName || documentUrl || documentFile) && (
                    <div className="mt-3 flex items-center justify-between gap-3 border p-3">
                      <span className="break-all text-sm text-[#494E5F]">
                        {documentName || documentUrl}
                      </span>
                      <div className="flex shrink-0 items-center gap-3">
                        {documentUrl &&
                        !documentFile &&
                        canViewAqarRowDocumentOnSite(documentUrl, documentName) &&
                        rowId ? (
                          <Link
                            href={getAqarRowDocumentViewPath(rowId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap text-sm text-primarycolor"
                          >
                            View on site
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleDocumentDelete}
                          className="cursor-pointer border-0 bg-transparent p-0 text-sm text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.document && <span className="text-sm text-red-500">{errors.document}</span>}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#6C768B]">Select a section to add details.</p>
          )}

          <div className="mt-6 flex justify-center gap-6">
            <Link
              href={`/admin/naac/aqar-documents/${documentId}/parts/${partId}`}
              className="cancelbtn px-4 py-2 leading-none"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              loading={loading}
              disabled={!hasSectionSelected}
              className="rounded-none border border-[#af251c] bg-primarycolor px-4 py-2 text-white"
            >
              {isEditMode ? 'Update Details' : 'Save Details'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
