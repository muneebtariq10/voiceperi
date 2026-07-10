"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

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


const chartConfig = {
   
    long: {
        label: "Long Calls",
        color: "hsl(var(--chart-1))",
    },
    medium: {
        label: "Medium Calls",
        color: "hsl(var(--chart-2))",
    },
    short: {
        label: "Short Calls",
        color: "hsl(var(--chart-3))",
    },

} satisfies ChartConfig

interface ChartData {
    longCalls: number;
    mediumCalls: number;
    shortCalls: number;
}

export function HorizontalBarChart({data}: { data: ChartData }) {
    console.log("data", data) ;
    const chartData = [
        { browser: "long", value: data?.longCalls || 0, fill: "#66b4aa", },
        { browser: "medium", value: data?.mediumCalls || 0, fill: "#a8d7cf", },
        { browser: "short", value: data?.shortCalls || 0, fill: "#d3edea" ,},
    ]
    
    return (
        <Card className="h-full rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
            <CardHeader className="flex flex-col px-6 pt-6 pb-2">
                <CardTitle className="text-[20px] font-semibold text-gray-900 tracking-tight text-start">Call Engagement Distribution</CardTitle>
                <CardDescription className="text-[14px] text-gray-500 font-medium text-left">Distribution of calls by length</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 flex items-center">
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 0,
                        }}
                    >
                        <YAxis
                            dataKey="browser"
                            type="category"
                            tickLine={false}
                            width={100}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label
                            }
                        /><XAxis
                        dataKey="value"
                        type="number"
                        hide={true}
                        domain={[0, 'auto']} // or [0, 'auto'] for dynamic scaling
                        tickCount={5}
                      />
                      
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent  />}
                        />
                        <Bar maxBarSize={15} dataKey="value" layout="vertical" radius={15} />
                    </BarChart>
                </ChartContainer>
            </CardContent>

        </Card>
    )
}
