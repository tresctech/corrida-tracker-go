import * as React from "react";
import { cn } from "@/lib/utils";

interface RunningCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "premium";
  children: React.ReactNode;
}

const RunningCard = React.forwardRef<HTMLDivElement, RunningCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "running-card rounded-xl p-6 running-transition",
          variant === "glow" && "running-glow animate-pulse-glow",
          variant === "premium" && "running-gradient text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
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