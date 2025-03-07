'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  User,
  Menu,
  X,
  Heart,
} from 'lucide-react';

interface SidebarLinkType {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const mainLinks: SidebarLinkType[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Habits',
      href: '/dashboard/habits',
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Quran Insights',
      href: '/dashboard/quran',
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Hadith Insights',
      href: '/dashboard/hadith',
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: 'Personalization',
      href: '/standalone-personalization',
    },
  ];

  const bottomLinks: SidebarLinkType[] = [
    {
      icon: <User className="h-5 w-5" />,
      label: 'Profile',
      href: '/dashboard/profile',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/standalone-personalization?tab=settings',
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const renderLinks = (links: SidebarLinkType[]) => {
    return links.map((link, index) => {
      const isActive = pathname === link.href;
      return (
        <Link
          key={index}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-green-50 text-green-600"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          onClick={isMobileOpen ? toggleMobileMenu : undefined}
        >
          <span className={cn(
            "flex-shrink-0",
            isActive ? "text-green-600" : "text-gray-500"
          )}>
            {link.icon}
          </span>
          <span className="flex-1">{link.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
        <div className="relative flex h-full w-72 max-w-xs flex-col overflow-y-auto py-4 px-3 bg-white shadow-xl transition-all">
          <div className="flex items-center justify-between px-2 mb-6">
            <span className="text-xl font-bold text-green-600">Deeni by SAFR+</span>
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <nav className="flex-1 space-y-1">
              {renderLinks(mainLinks)}
            </nav>
            <div>
              <div className="my-4 h-px bg-gray-200" />
              <nav className="space-y-1">
                {renderLinks(bottomLinks)}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-16 items-center justify-between px-4 py-5">
          <span className="text-2xl font-bold text-green-600">Deeni by SAFR+</span>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-2">
          <nav className="flex flex-col gap-1">
            {renderLinks(mainLinks)}
          </nav>
          <div>
            <div className="my-4 h-px bg-gray-200" />
            <nav className="flex flex-col gap-1">
              {renderLinks(bottomLinks)}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 