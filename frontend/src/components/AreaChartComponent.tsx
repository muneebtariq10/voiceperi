"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// const chartData = [
//   { date: "January", value: 100 },
//   { date: "February", value: 175 },
//   { date: "March", value: 107 },
//   { date: "April", value: 73 },
//   { date: "May", value: 209 },
//   { date: "June", value: 274 },
//   { date: "July", value: 214 },
//   { date: "August", value: 314 },
//   { date: "September", value: 214 },
//   { date: "October", value: 414 },
// ]

const chartConfig = {
  desktop: {
    label: "value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type AreaChartComponentProps = {
  totalChartData: { date: string; value: number }[];
  variant?: string;
  title: string;
  desc: string;
};

export function AreaChartComponent({ totalChartData,variant , title, desc}:AreaChartComponentProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col px-[30px]">
        <CardTitle className="text-[20px] font-[600] text-start">{title}</CardTitle>
        <CardDescription className="text-[14px] font-[400]">
          {desc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <svg width="0" height="0">
          <defs>
            <linearGradient id="colorGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#F1EDFF00", stopOpacity: 1 }} />
              <stop offset="40%" style={{ stopColor: "#46a79d", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#46a79d", stopOpacity: 1 }} />
            </linearGradient>


            <linearGradient id="colorGradientPurple" x1="0%" y1="100%" x2="1%" y2="1%">
              <stop offset="0%" style={{ stopColor: "#F1EDFF00", stopOpacity: .5 }} />
              <stop offset="27%" style={{ stopColor: "#46a79d", stopOpacity: .7 }} />
              <stop offset="100%" style={{ stopColor: "#46a79d", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>

        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={totalChartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (value.includes('-') && value.length === 7) {
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }
                return date.toLocaleDateString('en-US', {
                  month: 'short', // "May"
                  day: 'numeric', // "4"
                });
              }}
            />
            <YAxis
              domain={[0, 'dataMax + 5']}
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              width={20}
              tickCount={6}  
              tickFormatter={(value) => value.toFixed(0)}
              interval="preserveStartEnd"
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="value"
              type={variant == 'blue' ? `basis` : 'monotone'}
              fill={variant === "blue" ? "url(#colorGradientBlue)" : "url(#colorGradientPurple)"}
              fillOpacity={0.4}
              stroke={variant === "blue" ? "#46a79d" : "#DDCCFC"}
              strokeWidth={variant === "blue" ? 2 : 0}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
