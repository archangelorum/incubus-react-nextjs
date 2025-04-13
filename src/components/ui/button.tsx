'use client';

import React from 'react';

const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 btn-glow",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 btn-glow",
    gradient: "bg-linear-to-r from-primary via-secondary to-accent text-white border border-transparent hover:border-primary/20 btn-glow",
    glow: "bg-primary/90 text-primary-foreground hover:bg-primary/80 glow-border btn-glow",
  },
  size: {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  }
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // We're simplifying this component to avoid TypeScript errors
    // In a real implementation, you might want to use a more sophisticated approach
    const variantClass = buttonVariants.variant[variant] || buttonVariants.variant.default;
    const sizeClass = buttonVariants.size[size] || buttonVariants.size.default;
    const combinedClassName = `${buttonVariants.base} ${variantClass} ${sizeClass} ${className || ''}`;
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };