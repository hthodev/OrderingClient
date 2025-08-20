"use client";
import React, { useEffect, useRef } from "react";
import BillPrint from "../components/Bill";

export default function BillPage() {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printedRef = useRef(false);

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const safeCloseOrBack = () => {
      if (printedRef.current) return;
      printedRef.current = true;

      // Cố gắng đóng tab (chỉ ổn nếu tab mở bằng window.open)
      window.close();

      // Fallback: nếu không đóng được (trình duyệt chặn), điều hướng quay lại
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          if (history.length > 1) history.back();
          else window.location.href = "/";
        }
      }, 200);
    };

    let printTimer: ReturnType<typeof setTimeout> | null = null;
    let handleAfterPrint: (() => void) | null = null;

    if (isMobile) {
      // MOBILE: KHÔNG dùng afterprint, chỉ dùng fallback 7s
      printTimer = setTimeout(() => {
        window.print();
        closeTimerRef.current = setTimeout(safeCloseOrBack, 7000);
      }, 500);
    } else {
      // DESKTOP: dùng afterprint chuẩn
      handleAfterPrint = () => {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        safeCloseOrBack();
      };
      window.addEventListener("afterprint", handleAfterPrint);

      printTimer = setTimeout(() => {
        window.print();
      }, 500);
    }

    return () => {
      if (printTimer) clearTimeout(printTimer);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (handleAfterPrint) window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  return <BillPrint />;
}
