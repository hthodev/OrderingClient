"use client";
import AccountManagement from "@/app/components/managers/Account";
import FoodManagement from "@/app/components/managers/Food";
import ReportManagement from "@/app/components/managers/Report";
import InvoiceManagement from "../components/managers/Invoice";

export default function ManagerRoute({ slug }: { slug: string }) {
  return (
    <div>
      {slug === "report" && <ReportManagement />}
      {slug === "food" && <FoodManagement />}
      {slug === "account" && <AccountManagement />}
      {slug === "report-invoice" && <InvoiceManagement />}

    </div>
  );
}
