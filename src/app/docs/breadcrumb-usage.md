# Dynamic Breadcrumb System

## Overview
The dynamic breadcrumb system allows you to easily set breadcrumbs for each page in the admin area. The breadcrumbs appear in the top navbar and update automatically based on the current page.

## Components

### 1. BreadcrumbProvider
Wrap your application with `BreadcrumbProvider` in the layout. This has already been added to `src/app/admin/layout.tsx`.

### 2. Breadcrumb Component
The `Breadcrumb` component is already integrated into the `Top` navbar component and will automatically display breadcrumbs based on the context.

### 3. usePageBreadcrumbs Hook
Use this hook in your page components to set breadcrumbs for that page.

### 4. PageBreadcrumbs Component (New!)
A component-based alternative to the hook for declarative breadcrumb setup.

## Multiple Usage Patterns

### Pattern 1: Using the Hook (Recommended)

```jsx
'use client';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const MyPage = () => {
  usePageBreadcrumbs({
    breadcrumbs: [
      { label: 'Parent', href: '/admin/parent' },
      { label: 'Current Page' }
    ],
    pageTitle: 'Page Title'
  });
  
  return <div>Page Content</div>;
};
```

### Pattern 2: Using PageBreadcrumbs Component

```jsx
'use client';
import PageBreadcrumbs from '@/app/components/common/PageBreadcrumbs';

const MyPage = () => {
  return (
    <>
      <PageBreadcrumbs
        items={[
          { label: 'Parent', href: '/admin/parent' },
          { label: 'Current Page' }
        ]}
        title="Page Title"
      />
      <div>Page Content</div>
    </>
  );
};
```

### Pattern 3: Automatic Generation from Path

```jsx
'use client';
import PageBreadcrumbs from '@/app/components/common/PageBreadcrumbs';

const MyPage = () => {
  return (
    <>
      <PageBreadcrumbs
        currentPath="/admin/about-us/college-glance"
        pathLabels={{
          '/admin': 'Dashboard',
          '/admin/about-us': 'About Us'
        }}
        title="College Glance"
      />
      <div>Page Content</div>
    </>
  );
};
```

### Pattern 4: Using the createBreadcrumb Helper

```jsx
'use client';
import { usePageBreadcrumbs, createBreadcrumb } from '@/app/hooks/usePageBreadcrumbs';

const MyPage = () => {
  usePageBreadcrumbs({
    breadcrumbs: [
      createBreadcrumb('Departments', '/admin/departments'),
      createBreadcrumb('All Departments', '/admin/all-departments'),
      createBreadcrumb('Add Department')
    ],
    pageTitle: 'Add New Department'
  });
  
  return <div>Page Content</div>;
};
```

## Example Implementations for Existing Pages

### About Us Page (`src/app/admin/about-us/page.js`)
```jsx
'use client';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const About = () => {
  usePageBreadcrumbs({
    breadcrumbs: [{ label: 'About Us' }],
    pageTitle: 'About Us Management'
  });
  return <div>...</div>;
};
```

### All Departments Page (`src/app/admin/all-departments/page.js`)
```jsx
'use client';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const AllDepartments = () => {
  usePageBreadcrumbs({
    breadcrumbs: [
      { label: 'Departments', href: '/admin/departments' },
      { label: 'All Departments' }
    ],
    pageTitle: 'All Departments'
  });
  return <div>...</div>;
};
```

### Events Page (`src/app/admin/events/page.js`)
```jsx
'use client';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const EventList = () => {
  usePageBreadcrumbs({
    breadcrumbs: [
      { label: 'Events', href: '/admin/events' },
      { label: 'All Events' }
    ],
    pageTitle: 'Events Management'
  });
  return <div>...</div>;
};
```

## Breadcrumb Item Interface

```typescript
interface BreadcrumbItem {
  label: string;        // Display text for the breadcrumb
  href?: string;        // Optional link URL (if not provided, it's not clickable)
  isCurrent?: boolean;  // Optional flag to mark as current page
}
```

## Default Behavior

- The breadcrumb automatically includes "Home" as the first item pointing to `/admin`
- The last breadcrumb item is highlighted in red (`#af251c`)
- When a page component unmounts, breadcrumbs are automatically reset (can be disabled with `resetOnUnmount: false`)
- Fallback breadcrumbs shown if context is unavailable

## Best Practices

1. **Always use in client components** - Breadcrumb hooks/components are client-side only.
2. **Set at page level** - Use in page components, not nested components.
3. **Logical hierarchy** - Follow navigation from general to specific.
4. **Provide href for navigable items** - Only current page should lack href.
5. **Descriptive titles** - Page title appears below breadcrumb trail.

## Quick Start for New Pages

### Option A (Simplest):
```jsx
'use client';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function Page() {
  usePageBreadcrumbs({
    breadcrumbs: [
      { label: 'Section', href: '/admin/section' },
      { label: 'Page Name' }
    ],
    pageTitle: 'Page Title'
  });
  
  return <div>Your content</div>;
}
```

### Option B (Declarative):
```jsx
'use client';
import PageBreadcrumbs from '@/app/components/common/PageBreadcrumbs';

export default function Page() {
  return (
    <>
      <PageBreadcrumbs
        items={[
          { label: 'Section', href: '/admin/section' },
          { label: 'Page Name' }
        ]}
        title="Page Title"
      />
      <div>Your content</div>
    </>
  );
}
```

## Notes

- System is already integrated into admin layout
- No manual Breadcrumb component imports needed in pages
- Multiple patterns available based on preference
- Automatically handles cleanup between page navigations
- Works for all admin pages (`/admin/*` routes)