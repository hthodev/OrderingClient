import type { Metadata } from "next";
import ManagerRoute from "@/app/pages/ManagerRoute";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const titleMap: Record<string, string> = {
    report: "Báo cáo",
    food: "Quản lý món ăn",
    account: "Quản lý tài khoản",
    "report-invoice": "Quản lý hoá đơn",
  };

  return { title: titleMap[slug] ?? "Quản lý" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ManagerRoute slug={slug} />;
}
