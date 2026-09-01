"use client"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Icons } from "@/components/svgIcons";

const chartData = [
  { visitors: 700, visitorIcon: Icons.visitorsCall, fill: "var(--color-default-lightblue)" },]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function PiChart({ data }: { data: string[] }) {
  const userHangups = data?.filter(reason => reason === 'user_hangup').length;
  const otherHangups = data?.length - userHangups;
  const userHangupPercentage = data?.length != 0 ? (userHangups / (userHangups + otherHangups)) * 100 : 0;
  const chartDegree = 360 * userHangupPercentage / 100
  const callData = [
    {
      name: 'Customer ended call',
      value: userHangups,
      fill: "var(--color-default-lightblue)",
      visitorIcon: Icons.visitorsCall,
    }
  ];

  // console.log('userHangupPercentage', userHangupPercentage);
  // console.log('chartDegree', chartDegree);
  // console.log('data', data);

  return (
    <Card className="flex flex-col h-full rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <CardHeader className="flex flex-col px-6 pt-6 pb-2">
        <CardTitle className="text-[20px] font-semibold text-gray-900 tracking-tight text-start">
          Reason call ended
        </CardTitle>
        <CardDescription className="text-[14px] text-gray-500 font-medium text-left">
          Calls aggregated by reason - why the call ended or completed
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 flex pb-6 pt-4 items-center justify-between gap-2 h-[220px] overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-full max-h-[140px] flex-shrink-0"
        >
          <RadialBarChart
            data={callData}
            startAngle={0}
            endAngle={chartDegree && chartDegree}
            innerRadius={45}
            outerRadius={75}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[50, 40]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <RadialBar dataKey="value" background cornerRadius={10} fill="var(--color-default-lightblue)" />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const VisitorIcon = chartData[0].visitorIcon;
                    return (
                      <>
                        <foreignObject
                          x={(viewBox.cx || 0) - 16}
                          y={(viewBox.cy || 0) - 25}
                          width="32"
                          height="32"
                        >
                          <div className="flex justify-center items-center w-full h-full">
                            <VisitorIcon className="w-6 h-6 text-primary" />
                          </div>
                        </foreignObject>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 15}
                            className="text-[11px] font-medium fill-[#475569]"
                          >
                            Total {data?.length} calls
                          </tspan>
                        </text>
                      </>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <div className="flex flex-col justify-center gap-3 min-w-0 flex-1">
          <div className="flex gap-2 items-start">
            <span className="w-3.5 h-3.5 mt-0.5 rounded-[4px] bg-[var(--color-default-lightblue)] shrink-0"></span>
            <p className="text-[12px] font-medium text-[#27364B] leading-tight break-words min-w-0 whitespace-normal">Customer ended call</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="w-3.5 h-3.5 mt-0.5 rounded-[4px] bg-gray-200 shrink-0"></span>
            <p className="text-[12px] font-medium text-[#27364B] leading-tight break-words min-w-0 whitespace-normal">Network issue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

