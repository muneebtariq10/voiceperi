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
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
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
    <Card className="flex flex-col h-[100%]">
      <CardHeader className="flex flex-col px-[30px]">
        <CardTitle className="text-[20px] font-[600] text-start">
          Reason call ended
        </CardTitle>
        <CardDescription className="text-[14px] font-[400] text-left">
          Calls aggregated by reason - why the call ended or completed
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 flex  pb-0">
        <ChartContainer
          config={chartConfig}
          className="px-1 aspect-square w-[55%] max-h-[190px]"
        >
          <RadialBarChart
            data={callData}
            startAngle={0}
            endAngle={chartDegree && chartDegree}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
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
                          x={(viewBox.cx || 0) - 25}
                          y={(viewBox.cy || 0) - 40}
                          width="50"
                          height="50"
                        >
                          <div className="flex justify-center items-center w-full h-full">
                            <VisitorIcon className="" />
                          </div>
                        </foreignObject>
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan

                          >
                            <VisitorIcon className="w-50 h-50" />
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="text-[15px] font-[500] font-[#475569]"
                          >
                            Total {data?.length} calls
                          </tspan>
                        </text></>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <div className="flex flex-col justify-center gap-[20px]">
          <div className="flex gap-[10px] items-center">
            <span className="w-[20px] h-[20px] rounded-[4px] bg-[var(--color-default-lightblue)]"></span>
            <p className="text-[15px] font-[500] font-[#27364B]">Customer ended call</p>
          </div>
          <div className="flex gap-[10px] items-center">
            <span className="w-[20px] h-[20px] rounded-[4px] bg-gray-300"></span>
            <p className="text-[15px] font-[500] font-[#27364B] ">Network issue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
