'use client';

import React, { type ReactNode } from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
  type HTMLMotionProps,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  User,
  Heart,
  LogOut,
} from 'lucide-react';

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

type DockProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  key?: string | number;
};

type DockLabelProps = {
  className?: string;
  children: ReactNode;
  isHovered?: MotionValue<number>;
  width?: MotionValue<number>;
};

type DockIconProps = Omit<HTMLMotionProps<'div'>, 'width' | 'isHovered'> & {
  className?: string;
  children: ReactNode;
  width?: MotionValue<number>;
  isHovered?: MotionValue<number>;
};

type DocContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

type DockProviderProps = {
  children: ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: height,
        scrollbarWidth: 'none',
      }}
      className='fixed bottom-16 left-0 right-0 flex items-end justify-center overflow-x-auto z-50'
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          'mx-auto flex w-fit gap-6 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 py-3 shadow-lg border border-gray-200/50 dark:border-neutral-800/50',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({ children, className, href, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthTransform, spring);

  const content = (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
      onClick={onClick}
    >
      {Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        const childElement = child as React.ReactElement;
        const isLabelComponent = childElement.type === DockLabel;
        
        const childProps = {
          width,
          ...(isLabelComponent ? { isHovered } : {}),
        };

        return cloneElement(childElement, childProps);
      })}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function DockLabel({ children, className, isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute -top-10 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur-md px-2 py-0.5 text-sm font-medium text-neutral-700 dark:text-white shadow-sm',
            className
          )}
          role='tooltip'
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, width, isHovered, style, ...rest }: DockIconProps) {
  const defaultWidth = useMotionValue(40);
  const widthTransform = useTransform(width || defaultWidth, (val) => val / 2);

  return (
    <motion.div
      {...rest}
      style={{ 
        ...style,
        width: widthTransform 
      }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </motion.div>
  );
}

export function AppDock() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const mainLinks = [
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
    {
      icon: <LogOut className="h-5 w-5" />,
      label: 'Logout',
      href: '#',
      onClick: handleLogout,
    },
  ];

  return (
    <Dock>
      {mainLinks.map((link, index) => {
        const isActive = pathname === link.href;
        return (
          <DockItem
            key={index}
            href={link.onClick ? undefined : link.href}
            onClick={link.onClick}
            className={cn(
              isActive && 'text-green-600'
            )}
          >
            <DockIcon>
              <div className={cn(
                'p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-neutral-700/50 transition-colors duration-200',
                isActive && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              )}>
                {link.icon}
              </div>
            </DockIcon>
            <DockLabel>{link.label}</DockLabel>
          </DockItem>
        );
      })}
    </Dock>
  );
}

export { Dock, DockIcon, DockItem, DockLabel }; 