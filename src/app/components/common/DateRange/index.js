'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';

/**
 * Normalize any date-like value to a Date at local midnight, or null.
 * @param {Date|string|null|undefined} value
 * @returns {Date|null}
 */
export function toDateOnly(value) {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Validates from/to dates. Returns an error message or empty string.
 *
 * @param {Date|string|null} fromValue
 * @param {Date|string|null} toValue
 * @param {{ requireBoth?: boolean }} [options]
 * @returns {string}
 */
export function validateDateRange(fromValue, toValue, { requireBoth = false } = {}) {
  const from = toDateOnly(fromValue);
  const to = toDateOnly(toValue);

  if (!from || !to) {
    if (requireBoth) {
      return 'From date and To date are required';
    }
    return '';
  }

  if (from.getTime() > to.getTime()) {
    return 'From date should be less than or equal to To date';
  }

  return '';
}

const labelClassName =
  'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

/**
 * Shared From / To date pair using PrimeReact Calendar.
 * Enforces: From ≤ To via minDate/maxDate, and clamps invalid typed/picker values.
 */
export default function DateRange({
  fromDate = null,
  toDate = null,
  onFromDateChange,
  onToDateChange,
  fromLabel = 'From (Date)',
  toLabel = 'To (Date)',
  required = false,
  validateOnChange = true,
  error,
  onErrorChange,
  className = '',
  dateFormat = 'dd/mm/yy',
  placeholder = 'dd/mm/yyyy',
  showIcon = true,
  fromCalendarProps = {},
  toCalendarProps = {},
}) {
  const isControlledError = error !== undefined;
  const [internalError, setInternalError] = useState('');

  // Normalized dates used only for min/max and comparisons (stable for constraints)
  const fromBound = toDateOnly(fromDate);
  const toBound = toDateOnly(toDate);
  const currentError = isControlledError ? error : internalError;

  const setError = (message) => {
    if (!isControlledError) {
      setInternalError(message);
    }
    onErrorChange?.(message);
  };

  const reportValidation = (fromValue, toValue) => {
    if (!validateOnChange) return '';
    const message = validateDateRange(fromValue, toValue, { requireBoth: false });
    setError(message);
    return message;
  };

  useEffect(() => {
    if (!isControlledError && validateOnChange) {
      setInternalError(validateDateRange(fromDate, toDate, { requireBoth: false }));
    }
  }, [fromDate, toDate, isControlledError, validateOnChange]);

  /**
   * When From changes: cannot be after To (picker maxDate + clamp typed values).
   */
  const handleFromChange = (value) => {
    let nextFrom = toDateOnly(value);
    const currentTo = toDateOnly(toDate);

    if (nextFrom && currentTo && nextFrom.getTime() > currentTo.getTime()) {
      nextFrom = currentTo;
    }

    onFromDateChange?.(nextFrom);
    reportValidation(nextFrom, currentTo);
  };

  /**
   * When To changes: cannot be before From (picker minDate + clamp typed values).
   */
  const handleToChange = (value) => {
    let nextTo = toDateOnly(value);
    const currentFrom = toDateOnly(fromDate);

    if (nextTo && currentFrom && nextTo.getTime() < currentFrom.getTime()) {
      nextTo = currentFrom;
    }

    onToDateChange?.(nextTo);
    reportValidation(currentFrom, nextTo);
  };

  const calendarDefaults = {
    locale: 'en',
    dateFormat,
    mask: '99/99/9999',
    placeholder,
    className: 'w-full',
    showIcon,
  };

  // Apply defaults first; minDate/maxDate last so range cannot be removed by overrides
  const fromProps = { ...calendarDefaults, ...fromCalendarProps };
  const toProps = { ...calendarDefaults, ...toCalendarProps };

  return (
    <div className={className}>
      <div className="flex gap-5">
        <div className="flex flex-col gap-1 w-full">
          <label className={labelClassName}>
            {fromLabel}
            {required && <span className="text-red-500"> *</span>}
          </label>
          <Calendar
            {...fromProps}
            value={fromBound}
            onChange={(e) => handleFromChange(e.value)}
            maxDate={toBound || undefined}
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className={labelClassName}>
            {toLabel}
            {required && <span className="text-red-500"> *</span>}
          </label>
          <Calendar
            {...toProps}
            value={toBound}
            onChange={(e) => handleToChange(e.value)}
            minDate={fromBound || undefined}
          />
        </div>
      </div>
      {currentError ? (
        <span className="text-red-500 text-sm mt-1 block">{currentError}</span>
      ) : null}
    </div>
  );
}
