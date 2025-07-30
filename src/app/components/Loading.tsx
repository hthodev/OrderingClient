"use client";

import { RingLoader } from "react-spinners";

export default function Loading({ text = "" }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <RingLoader color="#2cd7dd" />
      {text && (
        <p className="text-red-500 text-sm font-semibold animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
