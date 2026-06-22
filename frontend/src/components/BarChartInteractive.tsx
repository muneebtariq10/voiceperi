"use client";

import { useEffect, useState } from "react";
import { AppUser } from "@/AppContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
const API_URL = import.meta.env.VITE_API_BASE_URL;
const chartConfig = {
  desktop: {
    label: "Positive",
    color: "var(--default-purple)",
  },
  mobile: {
    label: "Negative",
    color: "var(--default-lightpurple)",
  },
  tablet: {
    label: "Neutral",
    color: "var(--default-lightblue)",
  },
} satisfies ChartConfig;

type HourlyStats = {
  [hour: string]: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
};

function formatDateForApi(date: Date) {
  return date.toISOString().split("T")[0]; // e.g., "2025-05-28"
}

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }); // e.g., "Wednesday, May 28, 2025"
}

export function BarChartInteractive() {
  const { user } = AppUser();
  const [chartData, setChartData] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (user?.role !== "admin" && user?.id) {
        params.append("id", user?.id);
      }
      const apiDate = formatDateForApi(date);
      params.append("date", apiDate);

      try {
        const response = await fetch(
          `${API_URL}api/call-history/business?${params.toString()}`
        );
        const data = await response.json();

        const hourlyStats: HourlyStats = data.hourlyStats || {};
        const transformed = Object.entries(hourlyStats).map(
          ([hour, stats]) => ({
            month: hour,
            desktop: stats.positive,
            mobile: stats.negative,
            tablet: stats.neutral,
          })
        );

        setChartData(transformed);
      } catch (error) {
        console.error("Failed to load chart data", error);
      }
    };

    fetchData();
  }, [date]);

  const goToPreviousDay = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1);
    setDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    setDate(next);
  };

  return (
    <Card className="w-full h-auto">
      <CardHeader className="flex flex-col px-[30px] gap-2">
        <CardTitle className="text-[20px] font-[600] text-start">
          Call Distribution by Hour
        </CardTitle>
        <CardDescription className="text-[14px] font-[400]">
          {formatDateForDisplay(date)}
        </CardDescription>
        <div className="flex gap-4 mt-2">
          <Button variant="outline" onClick={goToPreviousDay}>
            ← Previous Day
          </Button>
          <Button variant="outline" onClick={goToNextDay}>
            Next Day →
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={5}
                  axisLine={false}
                  domain={[0, "auto"]}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar
                  dataKey="desktop"
                  stackId="a"
                  barSize={20}
                  fill="var(--default-purple)"
                />
                <Bar dataKey="mobile" stackId="a" barSize={20} fill="#F0E5FC" />
                <Bar
                  dataKey="tablet"
                  stackId="a"
                  barSize={20}
                  fill="var(--default-lightpurple)"
                  radius={[20, 20, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
