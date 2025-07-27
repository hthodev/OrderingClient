"use client";

import Image from "next/image";
import TableLayout from "./components/TableLayout";
import HomeService from "./services/home";
import TABLE from "./constants/tables";
import { useEffect, useState } from "react";
import Loading from "./components/Loading";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm m-2">
        <TableLayout/>
      </div>
    </div>
  );
}
