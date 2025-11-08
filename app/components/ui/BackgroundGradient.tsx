"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("relative p-[2px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-60 group-hover:opacity-100 blur-sm transition duration-500",
          "bg-[conic-gradient(from_var(--gradient-angle),#ff00aa,#00FFF1,#7303c0,#00FFF1,#ff00aa)]",
          "animate-gradient-rotate"
        )}
      />
      <div className={cn("relative z-10 bg-neutral-800 rounded-3xl", className)}>
        {children}
      </div>
    </div>
  );
};
