"use client";

import TableLayout from "./components/TableLayout";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm m-2">
        <TableLayout/>
      </div>
    </div>
  );
}
