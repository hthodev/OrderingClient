'use client'
import AccountManagement from "@/app/components/managers/Account";
import FoodManagement from "@/app/components/managers/Food";
import ReportManagement from "@/app/components/managers/Report";
import { useParams } from "next/navigation";

export default function ManagerPage() {
  const params = useParams();
  const slug = params?.slug;

  return (
    <div>
      {slug === "report" && <ReportManagement />}
      {slug === "food" && <FoodManagement />}
      {slug === "account" && <AccountManagement />}
    </div>
  );
}
