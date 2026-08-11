'use client';

import React from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

/**
 * Reusable admin data table with optional header, search, lazy pagination and dynamic columns.
 *
 * @param {Object} props
 * @param {Array} props.value - Row data
 * @param {Array} props.columns - Column configs passed to PrimeReact Column
 *   Each item: { field?, header, body?, sortable?, style?, align?, className?, sortField?, ...rest }
 * @param {boolean} [props.loading]
 * @param {boolean} [props.lazy=true]
 * @param {boolean} [props.paginator=true]
 * @param {number} [props.totalRecords]
 * @param {number} [props.first=0]
 * @param {number} [props.rows=10]
 * @param {string|null} [props.sortField]
 * @param {number|null} [props.sortOrder]
 * @param {Function} [props.onPage]
 * @param {Function} [props.onSort]
 * @param {number[]} [props.rowsPerPageOptions=[5,10,25,50]]
 * @param {string} [props.tableClassName='custTable tableCust']
 * @param {string} [props.emptyMessage]
 * @param {string} [props.headerTitle] - Optional card header title
 * @param {boolean} [props.showSearch=false]
 * @param {string} [props.searchPlaceholder='Search here..']
 * @param {string} [props.searchValue]
 * @param {Function} [props.onSearch] - (event) => void from InputText onChange
 * @param {React.ReactNode} [props.headerActions] - Extra controls in header (right side)
 * @param {boolean} [props.card=true] - Wrap in white card container
 * @param {Object} [props.dataTableProps] - Extra props forwarded to PrimeReact DataTable
 */
export default function CommonDataTable({
  value = [],
  columns = [],
  loading = false,
  lazy = true,
  paginator = true,
  totalRecords = 0,
  first = 0,
  rows = 10,
  sortField = null,
  sortOrder = null,
  onPage,
  onSort,
  rowsPerPageOptions = [5, 10, 25, 50],
  tableClassName = 'custTable tableCust',
  emptyMessage = 'No records found.',
  headerTitle,
  showSearch = false,
  searchPlaceholder = 'Search here..',
  searchValue,
  onSearch,
  headerActions,
  card = true,
  dataTableProps = {},
}) {
  const showHeader = Boolean(headerTitle || showSearch || headerActions);

  const currentPageReportTemplate = `Rows ${first + 1} - ${
    first + (value?.length || 0)
  } of ${totalRecords}`;

  const table = (
    <div className="min-w-0 overflow-x-auto">
      <PrimeDataTable
        value={value}
        className={tableClassName}
        scrollable
        showGridlines
        loading={loading}
        paginator={paginator}
        totalRecords={totalRecords}
        lazy={lazy}
        onPage={onPage}
        onSort={onSort}
        first={first}
        rows={rows}
        sortField={sortField}
        sortOrder={sortOrder}
        rowsPerPageOptions={rowsPerPageOptions}
        currentPageReportTemplate={currentPageReportTemplate}
        paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
        emptyMessage={emptyMessage}
        {...dataTableProps}
      >
        {columns.map((col, index) => {
          const { key, ...columnProps } = col;
          return <Column key={key || col.field || col.header || index} {...columnProps} />;
        })}
      </PrimeDataTable>
    </div>
  );

  if (!card) {
    return table;
  }

  return (
    <div className="bg-white border card-shadow min-w-0 overflow-hidden">
      {showHeader && (
        <div className="px-5 py-3 border-b border-[#EAEDF3] flex justify-between items-center gap-3 flex-wrap">
          {headerTitle ? (
            <div className="text-[#101828] font-medium">{headerTitle}</div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {headerActions}
            {showSearch && (
              <IconField iconPosition="left" className="app-search-field">
                <InputIcon className="pi pi-search" />
                <InputText
                  placeholder={searchPlaceholder}
                  className="app-search-input"
                  {...(searchValue !== undefined ? { value: searchValue } : {})}
                  onChange={onSearch}
                />
              </IconField>
            )}
          </div>
        </div>
      )}
      {table}
    </div>
  );
}
