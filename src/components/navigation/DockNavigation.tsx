import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  BookOpenIcon,
  GraduationCapIcon,
  HeartIcon,
  SettingsIcon,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Quran',
    href: '/dashboard/quran',
    icon: BookOpenIcon,
  },
  {
    name: 'Learn',
    href: '/dashboard/learn',
    icon: GraduationCapIcon,
  },
  {
    name: 'Self-Reflections',
    href: '/dashboard/self-reflections',
    icon: HeartIcon,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: SettingsIcon,
  },
];

export default function DockNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t">
      <div className="container flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 