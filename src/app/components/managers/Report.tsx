"use client";
import ManagerService, {
  ChartItem,
  TopFoodChartItem,
} from "@/app/services/manager";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Pie,
  Cell,
  PieChart,
  Legend,
} from "recharts";
import Loading from "../Loading";
import Manager from "./Manager";

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
  const [revenue, setRevenue] = useState<ChartItem[]>();
  const [topFoods, setTopFoods] = useState<TopFoodChartItem[]>();
  const [topBeers, setTopBeers] = useState<TopFoodChartItem[]>();
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const [revenueRes, topFoodRes] = await Promise.all([
          ManagerService.OrdersByTimeRange(filter),
          ManagerService.TopFoods(filter),
        ]);
        setRevenue(revenueRes.chartData);
        setTopFoods(topFoodRes.topFoods);
        setTopBeers(topFoodRes.topBeers);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharts();
  }, [filter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 px-3 py-2 rounded shadow text-sm">
          <p className="text-gray-800 font-medium">{label}</p>
          <p className="text-blue-600">
            Doanh thu: {payload[0].value.toLocaleString()}.000₫
          </p>
        </div>
      );
    }
    return null;
  };

  const filterOptions = [
    { label: "Tuần", value: "week" },
    { label: "Tháng", value: "month" },
    { label: "Năm", value: "year" },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-20">
            <Loading />
          </div>
        </div>{" "}
      </div>
    );

  return (
    <div className="flex">
      <Manager />
      <section className="p-4 w-full mt-14">
        <h1 className="text-2xl font-bold mb-2">📊 Báo cáo doanh số</h1>
        <p className="text-gray-600 mb-4">
          Tổng quan doanh thu theo tuần, tháng, năm.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                filter === option.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="w-full h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <XAxis dataKey="label" stroke="#a948d6ff" />
              <YAxis tickFormatter={(value) => `${value.toLocaleString()}k`} />
              <Tooltip content={<CustomTooltip />} />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Bar dataKey="total" fill="#8884d8" barSize={30}>
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(value: any) => `${value.toLocaleString()}k`}
                  style={{ fill: "#333", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 mb-4">
          <p>
            Tổng doanh thu của{" "}
            {filter === "week" ? "Tuần" : filter === "month" ? "Tháng" : "Năm"}{" "}
            này:{" "}
            <span className="font-semibold">
              {(
                revenue?.reduce((acc, curr) => acc + curr.total, 0) || 0
              ).toLocaleString("vi-VN")}
              .000đ
            </span>
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Top bia được order nhiều nhất
        </h2>

        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={topBeers}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label
                isAnimationActive={false}
              >
                {topBeers?.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                align="center"
                verticalAlign={isMobile ? "bottom" : "middle"}
              />{" "}
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 w-full max-w-md mt-4">
          <h2 className="text-xl font-semibold mb-4">
            Top món ăn theo số lượng order
          </h2>
          <div className="max-h-80 overflow-y-auto pr-2">
            <ul className="space-y-2">
              {topFoods?.map((food: TopFoodChartItem, index: number) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <span className="text-gray-800">{food.name}</span>
                  <span className="font-bold text-indigo-600">
                    {food.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
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
