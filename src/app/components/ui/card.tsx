import { cn } from "@/app/lib/utils";
import React from "react";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-md p-4",
        className
      )}
    >
      {children}
    </div>
  );
};
