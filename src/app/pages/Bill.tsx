"use client";
import React, { useEffect } from "react";
import BillPrint from "../components/Bill";

export default function BillPage() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);
  return <BillPrint />;
}
