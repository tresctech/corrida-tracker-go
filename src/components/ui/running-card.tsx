import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const runningCardVariants = cva(
  "running-card p-6 text-card-foreground",
  {
    variants: {
      variant: {
        default: "running-card",
        glow: "running-card running-glow",
        premium: "running-card running-glow animate-pulse-glow border-2 border-running-primary/20"
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface RunningCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof runningCardVariants> {}

const RunningCard = React.forwardRef<HTMLDivElement, RunningCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(runningCardVariants({ variant, size, className }))}
      {...props}
    />
  )
);

RunningCard.displayName = "RunningCard";

const RunningCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

RunningCardHeader.displayName = "RunningCardHeader";

const RunningCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-running-primary",
      className
    )}
    {...props}
  />
));

RunningCardTitle.displayName = "RunningCardTitle";

const RunningCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-running-neutral", className)}
    {...props}
  />
));

RunningCardDescription.displayName = "RunningCardDescription";

const RunningCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

RunningCardContent.displayName = "RunningCardContent";

const RunningCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

RunningCardFooter.displayName = "RunningCardFooter";

export {
  RunningCard,
  RunningCardHeader,
  RunningCardTitle,
  RunningCardDescription,
  RunningCardContent,
  RunningCardFooter
};