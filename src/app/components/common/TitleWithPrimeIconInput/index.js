'use client';

import { useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { PRIME_ICON_OPTIONS } from '@/app/utils/primeIconOptions';

const NONE_ICON_VALUE = '__none__';

const iconPanelPt = {
  list: { className: 'max-h-[16rem]' },
};

const iconDropdownPt = {
  root: { className: 'title-prime-icon-dropdown' },
  label: { className: 'title-prime-icon-dropdown-label' },
  trigger: { className: 'title-prime-icon-dropdown-trigger' },
};

function resolveIconClass(option) {
  if (!option) return '';
  if (typeof option === 'string') return option;
  return option.value ?? '';
}

export default function TitleWithPrimeIconInput({
  titleRegister,
  iconValue,
  onIconChange,
  placeholder = 'Enter your title',
  titleId,
}) {
  const iconOptions = useMemo(
    () => [{ label: 'No icon', value: NONE_ICON_VALUE }, ...PRIME_ICON_OPTIONS],
    []
  );

  const dropdownValue = iconValue ? iconValue : NONE_ICON_VALUE;

  const handleIconChange = (next) => {
    onIconChange(next === NONE_ICON_VALUE ? '' : next ?? '');
  };

  return (
    <div
      className="flex w-full overflow-hidden border border-[#ced4da] bg-white focus-within:border-[#3B82F6] focus-within:shadow-[0_0_0_0.2rem_rgba(59,130,246,0.25)]"
    >
      <Dropdown
        id={titleId ? `${titleId}-icon` : undefined}
        value={dropdownValue}
        options={iconOptions}
        onChange={(e) => handleIconChange(e.value)}
        filter
        filterBy="label"
        optionLabel="label"
        optionValue="value"
        scrollHeight="16rem"
        pt={{ ...iconDropdownPt, ...iconPanelPt }}
        className="shrink-0 border-0 border-r border-[#ced4da] rounded-none shadow-none"
        panelClassName="title-prime-icon-panel"
        valueTemplate={(option) => {
          const iconClass = resolveIconClass(option);
          if (!iconClass || iconClass === NONE_ICON_VALUE) {
            return (
              <i
                className="pi pi-palette text-[#6b7280] text-[1.125rem]"
                aria-hidden="true"
                title="Choose icon"
              />
            );
          }
          return <i className={`${iconClass} text-[1.125rem] text-[#374151]`} aria-hidden="true" />;
        }}
        itemTemplate={(option) =>
          option.value === NONE_ICON_VALUE ? (
            <span className="text-sm text-[#6b7280]">{option.label}</span>
          ) : (
            <div className="flex items-center gap-2 py-0.5">
              <i className={option.value} aria-hidden="true" />
              <span className="text-sm truncate">{option.label}</span>
            </div>
          )
        }
        aria-label="Sub point icon"
      />
      <InputText
        id={titleId}
        {...titleRegister}
        placeholder={placeholder}
        className="flex-1 min-w-0 border-0 rounded-none shadow-none w-full"
      />
    </div>
  );
}
