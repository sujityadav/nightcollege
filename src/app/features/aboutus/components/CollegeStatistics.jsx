'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

function StatisticStatusSwitch({ rowData, disabled, onToggle }) {
  return (
    <InputSwitch
      checked={Boolean(rowData.status)}
      disabled={disabled}
      onChange={(event) => onToggle(rowData, event.value)}
    />
  );
}

const emptyForm = { title: '', count: '', sortOrder: '0', status: true };

export default function CollegeStatistics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [params, setParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'sortOrder',
    sortOrder: 1,
    search: '',
  });
  const toast = useRef(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/college-statistics', {
        params: {
          page: params.page,
          limit: params.rows,
          sortField: params.sortField,
          sortOrder: params.sortOrder,
          search: params.search,
        },
      });
      setRows(response.data?.data || []);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load college statistics',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.rows, params.search, params.sortField, params.sortOrder]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title || '',
      count: row.count ?? '',
      sortOrder: String(row.sortOrder ?? 0),
      status: Boolean(row.status),
    });
  };

  const handleStatusToggle = async (rowData, status) => {
    const previousStatus = rowData.status;
    setRows((items) =>
      items.map((item) => (item._id === rowData._id ? { ...item, status } : item))
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/college-statistics/${rowData._id}`, {
        title: rowData.title,
        count: rowData.count,
        sortOrder: rowData.sortOrder,
        status,
      });
      if (!response.data?.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Statistic marked ${status ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setRows((items) =>
        items.map((item) =>
          item._id === rowData._id ? { ...item, status: previousStatus } : item
        )
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not update status',
        life: 3000,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deleteRow = async (id) => {
    try {
      const response = await axios.delete(`/api/college-statistics/${id}`);
      if (!response.data?.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Statistic deleted successfully',
        life: 2500,
      });
      if (editingId === id) resetForm();
      fetchRows();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete statistic',
        life: 3000,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const count = String(form.count).trim();
    const sortOrder = Number(form.sortOrder);

    if (!title || !count) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Title and count are required',
        life: 3000,
      });
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Enter a valid sort order',
        life: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { title, count, sortOrder, status: form.status };
      const response = editingId
        ? await axios.put(`/api/college-statistics/${editingId}`, payload)
        : await axios.post('/api/college-statistics', payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to save statistic');
      }

      toast.current?.show({
        severity: 'success',
        summary: editingId ? 'Updated' : 'Saved',
        detail: `Statistic ${editingId ? 'updated' : 'saved'} successfully`,
        life: 2500,
      });
      resetForm();
      fetchRows();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Could not save statistic',
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: 'title', header: 'Title', sortable: true, style: { minWidth: '14rem' } },
    { field: 'count', header: 'Count', sortable: true, style: { minWidth: '8rem' } },
    {
      field: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      style: { minWidth: '8rem' },
      align: 'center',
    },
    {
      header: 'Status',
      align: 'center',
      style: { minWidth: '8rem' },
      body: (row) => (
        <StatisticStatusSwitch
          rowData={row}
          disabled={updatingStatusId === row._id}
          onToggle={handleStatusToggle}
        />
      ),
    },
    {
      header: 'Action',
      align: 'center',
      style: { minWidth: '7rem', background: '#fbf7dc' },
      body: (row) => (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => startEdit(row)}
            className="cursor-pointer border-0 bg-transparent p-0 leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </button>
          <button
            type="button"
            onClick={() =>
              confirmDialog({
                header: 'Delete statistic',
                message: `Delete "${row.title}"?`,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Yes, Delete',
                rejectLabel: 'Cancel',
                acceptClassName: 'p-button-danger',
                accept: () => deleteRow(row._id),
              })
            }
            className="cursor-pointer border-0 bg-transparent p-0 leading-none text-red-500"
            title="Delete"
          >
            <i className="pi pi-trash text-[18px]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-w-0 bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]">
      <Toast ref={toast} />
      <ConfirmDialog />

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-8 max-w-4xl space-y-4 border-b border-[#EEF2F8] pb-8"
      >
        <h3 className="m-0 text-center text-[18px] font-[700] text-[#19212A]">
          {editingId ? 'Edit College Statistic' : 'Add College Statistic'}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-[14px] font-[500] text-[#212325]">Title</label>
            <InputText
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Enter title"
              className="rounded-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[14px] font-[500] text-[#212325]">Count</label>
            <InputText
              value={form.count}
              onChange={(e) => setForm((current) => ({ ...current, count: e.target.value }))}
              placeholder="Enter count"
              className="rounded-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[14px] font-[500] text-[#212325]">Sort Order</label>
            <InputText
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => setForm((current) => ({ ...current, sortOrder: e.target.value }))}
              placeholder="0"
              className="rounded-none"
            />
          </div>
        </div>
        {editingId ? (
          <div className="flex items-center justify-center gap-3">
            <label className="text-[14px] font-[500] text-[#212325]">Status</label>
            <InputSwitch
              checked={form.status}
              onChange={(e) => setForm((current) => ({ ...current, status: e.value }))}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="submit"
            loading={saving}
            className="border-[#af251c] bg-primarycolor px-4 py-2 text-white"
          >
            {editingId ? 'Update' : 'Save'}
          </Button>
          {editingId ? (
            <Button
              type="button"
              label="Cancel"
              className="cancelbtn px-4 py-2"
              onClick={resetForm}
            />
          ) : null}
        </div>
      </form>

      <div className="w-full min-w-0">
        <CommonDataTable
          value={rows}
          columns={columns}
          loading={loading}
          totalRecords={totalRecords}
          first={params.first}
          rows={params.rows}
          sortField={params.sortField}
          sortOrder={params.sortOrder}
          onPage={(event) =>
            setParams((current) => ({
              ...current,
              first: event.first,
              rows: event.rows,
              page: event.page + 1,
            }))
          }
          onSort={(event) =>
            setParams((current) => ({
              ...current,
              sortField: event.sortField,
              sortOrder: event.sortOrder,
              first: 0,
              page: 1,
            }))
          }
          headerTitle="College Statistics"
          showSearch
          searchValue={params.search}
          onSearch={(event) =>
            setParams((current) => ({
              ...current,
              search: event.target.value,
              first: 0,
              page: 1,
            }))
          }
          dataTableProps={{ dataKey: '_id' }}
        />
      </div>
    </div>
  );
}
