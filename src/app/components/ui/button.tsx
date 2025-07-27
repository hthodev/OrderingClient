import { cn } from "@/app/lib/utils";
import React from "react";

export const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
