'use client';

import * as React from 'react';

const badgeVariants = {
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variant: {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
    ghost: "border-transparent bg-background/20 backdrop-blur-xs text-foreground hover:bg-background/30",
    glow: "border-primary/50 bg-primary/10 text-primary relative after:absolute after:inset-0 after:rounded-full after:border after:border-primary/50 after:blur-[2px] after:opacity-50",
    gradient: "border-transparent bg-linear-to-r from-primary via-secondary to-accent text-white animate-gradient-shift",
  }
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants.variant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = badgeVariants.variant[variant] || badgeVariants.variant.default;
  const combinedClassName = `${badgeVariants.base} ${variantClass} ${className || ''}`;
  
  return (
    <div className={combinedClassName} {...props} />
  );
}

export { Badge, badgeVariants };