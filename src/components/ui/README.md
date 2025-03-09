# UI Components

This directory contains reusable UI components that can be used throughout the application to maintain consistent design and functionality.

## PageHeaderCard

The `PageHeaderCard` component is a standardized header container designed to be used at the top of pages to ensure consistent page headers across the application.

### Usage

```tsx
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { FaUser } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

// Basic usage
<PageHeaderCard
  title="Page Title"
  description="A brief description of the page's purpose"
  icon={FaUser}
/>

// With actions
<PageHeaderCard
  title="Settings"
  description="Configure your application settings"
  icon={FaCog}
  actions={
    <Button size="sm">Save Changes</Button>
  }
/>

// With multiple actions
<PageHeaderCard
  title="Events"
  description="Manage your calendar events"
  icon={FaCalendar}
  actions={
    <>
      <Button variant="outline" size="sm">Filter</Button>
      <Button size="sm">Add Event</Button>
    </>
  }
/>

// With custom styling
<PageHeaderCard
  title="Dashboard"
  description="Your personalized overview"
  className="bg-gradient-to-r from-blue-50 to-indigo-50"
  titleClassName="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600"
/>
```

### Props

| Prop                 | Type                  | Description                                        |
|----------------------|-----------------------|----------------------------------------------------|
| `title`              | `string \| ReactNode` | The title of the page                              |
| `description`        | `string \| ReactNode` | Optional description text                          |
| `icon`               | `IconType`            | Optional React icon component                      |
| `actions`            | `ReactNode`           | Optional actions to display (buttons, etc.)        |
| `className`          | `string`              | Optional additional classes for the card container |
| `titleClassName`     | `string`              | Optional additional classes for the title          |
| `descriptionClassName` | `string`            | Optional additional classes for the description    |

### Design Features

- Consistent styling across all pages
- Responsive layout that works well on all screen sizes
- Accessibility-friendly design
- Customizable through props
- Visual hierarchy with title and description
- Optional icon support
- Support for page actions (buttons, dropdowns, etc.)

## Example Implementation

Here's how the PageHeaderCard is implemented in the Habits Tracker page:

```tsx
<PageHeaderCard
  title="Habits Tracker"
  description="Track and manage your daily Islamic habits to build consistency"
  icon={FaTasks}
  actions={
    <Link href="/dashboard/habits/new" className="inline-flex items-center">
      <Button size="sm">
        <FaPlus className="mr-2 h-3 w-3" />
        New Habit
      </Button>
    </Link>
  }
/>
```

## Other Components

[Additional components documentation can be added here] 