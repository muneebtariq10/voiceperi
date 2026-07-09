import { 
  IconTrendingDown, 
  IconTrendingUp, 
  IconClockHour4, 
  IconPhoneCall, 
  IconChartBar, 
  IconCoin 
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CallData {
  totalCallMinutes: {
    callMinutes: number;
    diff: number;
  };
  numberOfCalls: {
    totalCalls: number;
    diff: number;
  };
  totalCost: {
    Cost: number;
    diff: number;
  };
  averageCostPerCall: {
    averageCost: number;
    diff: number;
  };
}

export function SectionCards({ callData }: { callData: CallData }) {

  return (
    <div className="grid grid-cols-1 gap-4 md:px-4 lg:pr-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 md:pl-0 pl-0">
      
      {/* Total Call Minutes Card */}
      <Card className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="grid grid-rows-2 items-center gap-x-2 p-5">
          <div className="row-span-2 flex items-center justify-center bg-indigo-50 w-[56px] h-[56px] rounded-full">
            <IconClockHour4 className="w-7 h-7 text-indigo-500" stroke={1.5} />
          </div>
          <CardDescription className="self-end text-gray-500 font-medium">Total call minutes</CardDescription>
          <CardTitle className="!text-[22px] md:text-2xl font-bold text-gray-900 tabular-nums">
            {callData?.totalCallMinutes?.callMinutes?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-4 bottom-4">
            <Badge variant="outline" className={`px-2 py-1 gap-1 font-medium border-0 ${
              callData?.totalCallMinutes?.diff !== undefined && callData.totalCallMinutes.diff > 0
                ? 'bg-emerald-50 text-emerald-600'
                : callData?.totalCallMinutes?.diff !== undefined && callData.totalCallMinutes.diff < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-gray-50 text-gray-600'
              }`}>
              {typeof callData?.totalCallMinutes?.diff === 'number' && (
                callData.totalCallMinutes.diff > 0
                  ? <IconTrendingUp className="w-3.5 h-3.5" />
                  : <IconTrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(callData?.totalCallMinutes?.diff ?? 0).toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Number of Calls Card */}
      <Card className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="grid grid-rows-2 items-center gap-x-2 p-5">
          <div className="row-span-2 flex items-center justify-center bg-amber-50 w-[56px] h-[56px] rounded-full">
            <IconPhoneCall className="w-7 h-7 text-amber-500" stroke={1.5} />
          </div>
          <CardDescription className="self-end text-gray-500 font-medium">Number of calls</CardDescription>
          <CardTitle className="!text-[22px] md:text-2xl font-bold text-gray-900 tabular-nums">
            {callData?.numberOfCalls?.totalCalls ?? 0}
          </CardTitle>
          <CardAction className="absolute right-4 bottom-4">
            <Badge variant="outline" className={`px-2 py-1 gap-1 font-medium border-0 ${
              callData?.numberOfCalls?.diff !== undefined && callData.numberOfCalls.diff > 0
                ? 'bg-emerald-50 text-emerald-600'
                : callData?.numberOfCalls?.diff !== undefined && callData.numberOfCalls.diff < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-gray-50 text-gray-600'
              }`}>
              {typeof callData?.numberOfCalls?.diff === 'number' && (
                callData.numberOfCalls.diff > 0
                  ? <IconTrendingUp className="w-3.5 h-3.5" />
                  : <IconTrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(callData?.numberOfCalls?.diff ?? 0).toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Total Cost Card */}
      <Card className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="grid grid-rows-2 items-center gap-x-2 p-5">
          <div className="row-span-2 flex items-center justify-center bg-emerald-50 w-[56px] h-[56px] rounded-full">
            <IconChartBar className="w-7 h-7 text-emerald-500" stroke={1.5} />
          </div>
          <CardDescription className="self-end text-gray-500 font-medium">Total cost</CardDescription>
          <CardTitle className="!text-[22px] md:text-2xl font-bold text-gray-900 tabular-nums">
            ${callData?.totalCost?.Cost?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-4 bottom-4">
            <Badge variant="outline" className={`px-2 py-1 gap-1 font-medium border-0 ${
              callData?.totalCost?.diff !== undefined && callData.totalCost.diff > 0
                ? 'bg-emerald-50 text-emerald-600'
                : callData?.totalCost?.diff !== undefined && callData.totalCost.diff < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-gray-50 text-gray-600'
              }`}>
              {typeof callData?.totalCost?.diff === 'number' && (
                callData.totalCost.diff > 0
                  ? <IconTrendingUp className="w-3.5 h-3.5" />
                  : <IconTrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(callData?.totalCost?.diff ?? 0).toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Average Cost Per Call Card */}
      <Card className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="grid grid-rows-2 items-center gap-x-2 p-5">
          <div className="row-span-2 flex items-center justify-center bg-rose-50 w-[56px] h-[56px] rounded-full">
            <IconCoin className="w-7 h-7 text-rose-500" stroke={1.5} />
          </div>
          <CardDescription className="text-nowrap self-end text-gray-500 font-medium">Avg cost per call</CardDescription>
          <CardTitle className="!text-[22px] md:text-2xl font-bold text-gray-900 tabular-nums">
            ${callData?.averageCostPerCall?.averageCost?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-4 bottom-4">
            <Badge variant="outline" className={`px-2 py-1 gap-1 font-medium border-0 ${
              callData?.averageCostPerCall?.diff !== undefined && callData.averageCostPerCall.diff > 0
                ? 'bg-emerald-50 text-emerald-600'
                : callData?.averageCostPerCall?.diff !== undefined && callData.averageCostPerCall.diff < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-gray-50 text-gray-600'
              }`}>
              {typeof callData?.averageCostPerCall?.diff === 'number' && (
                callData.averageCostPerCall.diff > 0
                  ? <IconTrendingUp className="w-3.5 h-3.5" />
                  : <IconTrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(callData?.averageCostPerCall?.diff ?? 0).toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

    </div>
  )
}
