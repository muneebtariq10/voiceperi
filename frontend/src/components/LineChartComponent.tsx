"use client"

// import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
//   { date: "January", value: 186 },
//   { date: "February", value: 305 },
//   { date: "March", value: 237 },
//   { date: "April", value: 73 },
//   { date: "May", value: 209 },
//   { date: "July", value: 254 },
//   { date: "August", value: 114 },
//   { date: "September", value: 314 },
// ]

const chartConfig = {
  desktop: {
    label: "value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function LineChartComponent({ callMinutesData }: { callMinutesData: string[] }) {
  return (
    <Card  >
      <CardHeader className="flex flex-col px-[30px]">
        <CardTitle className="text-[20px] font-[600] text-start">Total call minutes</CardTitle>
        <CardDescription className="text-[14px] font-[400]">Total number of minutes spent on call each day</CardDescription>
      </CardHeader>
      <CardContent >
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={callMinutesData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              scale="point"
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
              cursor={true}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="#46a79d"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
