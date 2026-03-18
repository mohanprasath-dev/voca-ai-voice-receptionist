'use client';

import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const portalVariants = cva('fixed inset-0 z-[200] flex', {
  variants: {
    position: {
      top: 'items-start',
      bottom: 'items-end',
      left: 'justify-start',
      right: 'justify-end',
    },
  },
  defaultVariants: { position: 'right' },
});

interface SheetPortalProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>,
    VariantProps<typeof portalVariants> {}

const SheetPortal = ({ position, children, ...props }: SheetPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div className={portalVariants({ position })}>{children}</div>
  </DialogPrimitive.Portal>
);
SheetPortal.displayName = DialogPrimitive.Portal.displayName;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-[200] scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg border',
  {
    variants: {
      position: {
        top: 'animate-in slide-in-from-top w-full duration-300',
        bottom: 'animate-in slide-in-from-bottom w-full duration-300',
        left: 'animate-in slide-in-from-left h-full duration-300',
        right: 'animate-in slide-in-from-right h-full duration-300',
      },
      size: {
        content: 'w-full',
        default: 'w-full',
        sm: 'w-full sm:max-w-sm',
        lg: 'w-full sm:max-w-lg',
        xl: 'w-full sm:max-w-xl',
        full: 'w-full h-full',
      },
    },
    compoundVariants: [
      {
        position: ['top', 'bottom'],
        size: 'content',
        class: 'max-h-screen',
      },
      {
        position: ['top', 'bottom'],
        size: 'default',
        class: 'h-1/3',
      },
      {
        position: ['top', 'bottom'],
        size: 'sm',
        class: 'h-1/4',
      },
      {
        position: ['top', 'bottom'],
        size: 'lg',
        class: 'h-1/2',
      },
      {
        position: ['top', 'bottom'],
        size: 'xl',
        class: 'h-2/3',
      },
      {
        position: ['top', 'bottom'],
        size: 'full',
        class: 'h-full',
      },
      {
        position: ['left', 'right'],
        size: 'content',
        class: 'max-w-screen',
      },
      {
        position: ['left', 'right'],
        size: 'default',
        class: 'w-3/4 sm:w-1/2 md:w-1/3',
      },
      {
        position: ['left', 'right'],
        size: 'sm',
        class: 'w-1/2 sm:w-1/3 md:w-1/4',
      },
      {
        position: ['left', 'right'],
        size: 'lg',
        class: 'w-full sm:w-2/3 md:w-1/2',
      },
      {
        position: ['left', 'right'],
        size: 'xl',
        class: 'w-full sm:w-5/6 md:w-2/3',
      },
      {
        position: ['left', 'right'],
        size: 'full',
        class: 'w-full',
      },
    ],
    defaultVariants: {
      position: 'right',
      size: 'default',
    },
  }
);

export interface DialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ position, size, className, children, ...props }, ref) => (
  <SheetPortal position={position}>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ position, size }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-foreground text-lg font-semibold', className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
