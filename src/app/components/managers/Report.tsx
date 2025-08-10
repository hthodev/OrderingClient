"use client";
import ManagerService, {
  ChartItem,
  TopFoodChartItem,
} from "@/app/services/manager";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Loading from "../Loading";
import Manager from "./Manager";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const COLORS = [
  "#8884d8",
  "#8dd1e1",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#d88884",
  "#84d8d8",
  "#888888",
  "#a084d8",
  "#ffbb28",
  "#d884d8",
  "#8c8c8c",
  "#84a8d8",
  "#ff6666",
  "#66cccc",
  "#b8a0d8",
  "#ccd888",
  "#d8b384",
];

export default function ReportManagement() {
  const [filter, setFilter] = useState<"week" | "month" | "year">("week");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [revenue, setRevenue] = useState<ChartItem[]>();
  const [topFoods, setTopFoods] = useState<TopFoodChartItem[]>();
  const [topBeers, setTopBeers] = useState<TopFoodChartItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const toISO = (d: Date) => {
    const local = new Date(d);
    const utc7 = new Date(local.getTime() + 7 * 60 * 60 * 1000);
    return utc7.toISOString();
  };
  const fmtInput = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const fromInput = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const addByFilter = (d: Date, step: number) => {
    const nd = new Date(d);
    if (filter === "week") nd.setDate(nd.getDate() + step * 7);
    else if (filter === "month") nd.setMonth(nd.getMonth() + step);
    else nd.setFullYear(nd.getFullYear() + step);
    return nd;
  };
  const startEndOfWeek = (d: Date) => {
    const nd = new Date(d);
    const day = (nd.getDay() + 6) % 7;
    const start = new Date(nd);
    start.setDate(nd.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };
  const periodLabel = useMemo(() => {
    if (filter === "week") {
      const { start, end } = startEndOfWeek(anchorDate);
      const ds = `${String(start.getDate()).padStart(2, "0")}/${String(
        start.getMonth() + 1
      ).padStart(2, "0")}`;
      const de = `${String(end.getDate()).padStart(2, "0")}/${String(
        end.getMonth() + 1
      ).padStart(2, "0")}`;
      return `${ds} – ${de}`;
    }
    if (filter === "month")
      return `${anchorDate.getMonth() + 1}/${anchorDate.getFullYear()}`;
    return `${anchorDate.getFullYear()}`;
  }, [filter, anchorDate]);

  useEffect(() => {
    const fetchCharts = async () => {
      setIsLoading(true);
      try {
        const [revenueRes, topFoodRes] = await Promise.all([
          ManagerService.OrdersByTimeRange(toISO(anchorDate), filter),
          ManagerService.TopFoods(toISO(anchorDate), filter),
        ]);
        setRevenue(revenueRes.chartData);
        setTopFoods(topFoodRes.topFoods);
        setTopBeers(topFoodRes.topBeers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();
  }, [filter, anchorDate]);

  const CustomTooltip = ({ active, payload, label }: any) =>
    active && payload?.length ? (
      <div className="bg-white/95 border border-gray-200 px-3 py-2 rounded-xl shadow text-sm">
        <p className="text-gray-800 font-medium">{label}</p>
        <p className="text-blue-600">
          Doanh thu: {payload[0].value.toLocaleString()}.000₫
        </p>
      </div>
    ) : null;

  const totalRevenue = (
    revenue?.reduce((a, c) => a + c.total, 0) || 0
  ).toLocaleString("vi-VN");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex">
      <Manager />
      <section className="w-full mt-14 p-4">
        {/* Header */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">📊 Báo cáo doanh số</h1>
          <p className="text-gray-600">
            Tổng quan doanh thu theo tuần, tháng, năm.
          </p>

          {/* Controls Card */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Segmented filter */}
            <div className="bg-gray-100 rounded-full p-1 w-fit shadow-inner">
              {(["week", "month", "year"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`px-4 py-1.5 text-sm rounded-full transition ${
                    filter === v
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-700 hover:text-blue-700"
                  }`}
                >
                  {v === "week" ? "Tuần" : v === "month" ? "Tháng" : "Năm"}
                </button>
              ))}
            </div>

            {/* Period navigator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <IconBtn
                  onClick={() => setAnchorDate((d) => addByFilter(d, -1))}
                  aria="Trước"
                >
                  ‹
                </IconBtn>
                <div className="px-3 h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium">
                  {periodLabel}
                </div>
                <IconBtn
                  onClick={() => setAnchorDate((d) => addByFilter(d, 1))}
                  aria="Sau"
                >
                  ›
                </IconBtn>
              </div>
              <button
                onClick={() => setAnchorDate(new Date())}
                className="h-12 px-3 rounded-xl border border-gray-200 bg-white text-sm hover:bg-gray-50"
              >
                Hôm nay
              </button>
              <DatePicker
                selected={anchorDate}
                onChange={(date) => setAnchorDate(date || new Date())}
                dateFormat="dd/MM/yyyy"
                calendarStartDay={1}
                className="h-12 px-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-28"
                popperPlacement="bottom-start"
                placeholderText="Chọn ngày"
              />
            </div>
          </div>

          {/* Charts */}
          <div className="mt-4 grid md:grid-cols-5 gap-4">
            {/* Revenue card */}
            <div className="md:col-span-3 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  Doanh thu theo{" "}
                  {filter === "week"
                    ? "tuần"
                    : filter === "month"
                    ? "tháng"
                    : "năm"}
                </h3>
                <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Tổng: {totalRevenue}.000đ
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue}>
                    <XAxis dataKey="label" stroke="#6b7280" />
                    <YAxis tickFormatter={(v) => `${v.toLocaleString()}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" />
                    <Bar
                      dataKey="total"
                      fill="#8876f0"
                      barSize={26}
                      radius={[10, 10, 0, 0]}
                    >
                      <LabelList
                        dataKey="total"
                        position="top"
                        formatter={(v: any) => `${v.toLocaleString()}k`}
                        style={{ fill: "#374151", fontSize: 12 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top lists */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 md:p-4">
                <h3 className="font-semibold mb-2">
                  Top bia được order nhiều nhất
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={topBeers}
                        dataKey="quantity"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                        isAnimationActive={false}
                      >
                        {topBeers?.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        layout={isMobile ? "horizontal" : "vertical"}
                        align="center"
                        verticalAlign={isMobile ? "bottom" : "middle"}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 md:p-4">
                <h3 className="font-semibold mb-3">Top món ăn theo số lượng</h3>
                <ul className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {topFoods?.map((f, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="font-semibold text-indigo-600">
                        {f.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Small round icon button */
function IconBtn({
  children,
  onClick,
  aria,
}: {
  children: any;
  onClick: () => void;
  aria: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="size-9 grid place-items-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] shadow-sm"
    >
      {children}
    </button>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}
