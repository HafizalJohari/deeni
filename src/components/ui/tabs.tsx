"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
        data-selected-value={selectedValue}
      />
    );
  }
);
Tabs.displayName = "Tabs";

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isSelected = context?.selectedValue === value;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isSelected
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50 hover:text-foreground",
          className
        )}
        onClick={() => context?.onValueChange(value)}
        data-state={isSelected ? "active" : "inactive"}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isSelected = context?.selectedValue === value;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        data-state={isSelected ? "active" : "inactive"}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

// Create a context to share the selected value
interface TabsContextValue {
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

// Wrap the Tabs component to provide context
const TabsWithContext = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(props.value || props.defaultValue);

    React.useEffect(() => {
      if (props.value !== undefined) {
        setSelectedValue(props.value);
      }
    }, [props.value]);

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (props.value === undefined) {
          setSelectedValue(newValue);
        }
        props.onValueChange?.(newValue);
      },
      [props.onValueChange, props.value]
    );

    return (
      <TabsContext.Provider
        value={{
          selectedValue,
          onValueChange: handleValueChange,
        }}
      >
        <Tabs ref={ref} {...props} />
      </TabsContext.Provider>
    );
  }
);
TabsWithContext.displayName = "Tabs";

export { TabsWithContext as Tabs, TabsList, TabsTrigger, TabsContent }; 