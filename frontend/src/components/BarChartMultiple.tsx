"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

const chartConfig = {
  desktop: {
    label: "value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartMultiple({
  totalCostData,
}: {
  totalCostData: string[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col px-[30px]">
        <CardTitle className="text-[20px] font-[600] text-start">
          Total cost
        </CardTitle>
        <CardDescription className="text-[14px] font-[400]">
          The total cost of calls made each day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={totalCostData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                if (value.includes("-") && value.length === 7) {
                  return date.toLocaleDateString("en-US", { month: "short" });
                }
                return date.toLocaleDateString("en-US", {
                  month: "short", // "May"
                  day: "numeric", // "4"
                });
              }}
            />
            <YAxis
              domain={[0, "dataMax + 5"]}
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              maxBarSize={20}
              dataKey="value"
              fill="var(--default-lightpurple)"
              radius={15}
            />
            {/* <Bar dataKey="mobile" fill="var(--color-mobile)" radius={15} /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
