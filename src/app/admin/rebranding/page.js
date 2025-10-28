'use client';
import React, { useEffect, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from 'primereact/button';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

export default function Rebranding() {
  const [data, setData] = useState([]);
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: ''
  });

  // Sidebar Items
  const SideBarNavItems = [
    { label: 'Rebranding', href: '/admin/rebranding' },
    { label: 'Contact Information', href: '/admin/rebranding/contact-info' },
    { label: 'Flash Screen Popup', href: '/admin/rebranding/home-popup' }
  ];

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { page, rows, sortField, sortOrder, search } = lazyParams;
      const res = await axios.get(`/api/rebranding`, {
        params: {
          page,
          limit: rows,
          search,
          sortField,
          sortOrder
        }
      });
      console.log("Fetched data:", res.data);
      setData(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (err) {
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lazyParams]);

  // Table Templates
  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link href={`/admin/rebranding/add-banners?id=${rowData._id}`} className="leading-none">
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <Link href="#" className="leading-none">
        <i className="pi pi-trash text-[18px]"></i>
      </Link>
    </div>
  );

  const BannerPic = (rowData) => (
    <Image
      src={rowData.image || "/images/admin/profile_banner.png"}
      alt={rowData.title}
      width={300}
      height={150}
      className="inline mb-3 rounded-md"
    />
  );

  const StatusTemplate = (rowData) => (
    <InputSwitch
      checked={rowData.status}
      onChange={() => console.log("toggle status", rowData.id)}
    />
  );

  // Search Handler
  const handleSearch = (e) => {
    setLazyParams({ ...lazyParams, search: e.target.value, page: 1, first: 0 });
  };

  // Pagination, Sorting, etc.
  const onPage = (event) => {
    setLazyParams({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: event.page + 1
    });
  };

  const onSort = (event) => {
    setLazyParams({
      ...lazyParams,
      sortField: event.sortField,
      sortOrder: event.sortOrder
    });
  };

  return (
    <div className="grid grid-cols-12 items-start">
      <div className="col-span-1">
        <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
      </div>

      <div className="col-span-11 p-5">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[22px] font-[700]">Banners</h2>
          <Link
            href="/admin/rebranding/add-banners"
            className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]"></i> Add
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-5 py-3 border-b border-[#EAEDF3] flex justify-between items-center">
            <div className="text-[#101828] font-medium">All Banners</div>
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText placeholder="Search" onChange={handleSearch} />
            </IconField>
          </div>

          <div className="overflow-auto">
            <DataTable
              value={data}
              className="custTable tableCust"
              scrollable
              showGridlines
              loading={loading}
              paginator
              totalRecords={totalRecords}
              lazy
              onPage={onPage}
              onSort={onSort}
              first={lazyParams.first}
              rows={lazyParams.rows}
              sortField={lazyParams.sortField}
              sortOrder={lazyParams.sortOrder}
              rowsPerPageOptions={[5, 10, 25, 50]}
              currentPageReportTemplate={`Rows ${lazyParams.first + 1} - ${
                lazyParams.first + data.length
              } of ${totalRecords}`}
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
            >
              <Column field="id" header="Sr.No." sortable style={{ minWidth: '3rem' }} />
              <Column header="Banner Picture" body={BannerPic} style={{ minWidth: '10rem' }} />
              <Column field="RebrandingData.data.sortno" header="Sort Number" sortable />
              <Column field="RebrandingData.data.title" header="Banner Title" sortable />
              <Column field="RebrandingData.data.description" header="Banner Description" sortable />
              <Column field="RebrandingData.data.status" header="Status" body={StatusTemplate} />
              <Column field="RebrandingData.data.fromDate" header="From (Date)" sortable />
              <Column field="RebrandingData.data.toDate" header="To (Date)" sortable />
              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                style={{ minWidth: '6rem', background: '#fbf7dc' }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
