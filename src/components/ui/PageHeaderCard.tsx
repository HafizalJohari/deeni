import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconType } from 'react-icons';

interface PageHeaderCardProps {
  title: string;
  description?: string;
  icon?: IconType;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const PageHeaderCard = ({
  title,
  description,
  icon: Icon,
  actions,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderCardProps) => {
  return (
    <Card className={cn("mb-6 overflow-hidden", className)}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/70" />
      
      <div className="flex items-center justify-between px-6 py-5">
        <CardHeader className="p-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
            )}
            
            <div>
              <CardTitle className={cn("text-xl font-bold", titleClassName)}>
                {title}
              </CardTitle>
              
              {description && (
                <CardDescription className={cn("mt-1 line-clamp-2", descriptionClassName)}>
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
};

export { PageHeaderCard };
export type { PageHeaderCardProps }; 