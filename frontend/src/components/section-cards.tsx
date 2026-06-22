import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import dollar from '../assets/dollar.png'
import call from '../assets/call.png'
import graph from '../assets/graph.png'
import person from '../assets/person.png'

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
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-2 md:px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs  lg:pr-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 md:pl-0 pl-0">
      <Card className="@container/card grid rounded-[8px] !bg-gradient-to-b !from-white !to-white relative ">
        <CardHeader className="grid grid-rows-2 items-center gap-x-2 ">
          <div className=" row-span-2 flex items-center justify-center bg-[#8280ff5c]  w-[60px] h-[60px] rounded-[23px]">
            {/* <IconUsers className="text-gray-700 w-6 h-6" /> */}
            <img className="w-[35px]" src={person} alt="" />
          </div>
          <CardDescription className="self-end">Total call minutes</CardDescription>
          <CardTitle className="!text-[20px] md:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {callData?.totalCallMinutes?.callMinutes?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-3 bottom-3 ">
            <Badge variant="outline" className={`!bg-[#F6F8FC] ${callData?.totalCallMinutes?.diff !== undefined &&
              callData.totalCallMinutes.diff > 0
              ? 'text-[#20AD22]'
              : callData?.totalCallMinutes?.diff !== undefined &&
                callData.totalCallMinutes.diff < 0
                ? 'text-[#AD2020]'
                : ''
              }`}>
              {typeof callData?.totalCallMinutes?.diff === 'number' && (
                callData.totalCallMinutes.diff > 0
                  ? <IconTrendingUp />
                  : <IconTrendingDown />
              )}
              {callData?.totalCallMinutes?.diff?.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card grid rounded-[8px] !bg-gradient-to-b !from-white !to-white relative">
        <CardHeader className="grid grid-rows-2 items-center gap-2 rounded-[8px]">
          <div className=" row-span-2 flex items-center justify-center bg-[#fec43d5a]  w-[60px] h-[60px] rounded-[23px]">
            {/* <IconUsers className="text-gray-700 w-6 h-6" /> */}
            <img className="w-[35px]" src={call} alt="" />
          </div>
          <CardDescription className="self-end">Number of calls</CardDescription>
          <CardTitle className="!text-[20px] md:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {callData?.numberOfCalls?.totalCalls ?? 0}
          </CardTitle>
          <CardAction className="absolute right-3 bottom-3">

            <Badge variant="outline" className={`!bg-[#F6F8FC] ${callData?.numberOfCalls?.diff !== undefined &&
              callData.numberOfCalls.diff > 0
              ? 'text-[#20AD22]'
              : callData?.numberOfCalls?.diff !== undefined &&
                callData.numberOfCalls.diff < 0
                ? 'text-[#AD2020]'
                : ''
              }`}>
              {typeof callData?.numberOfCalls?.diff === 'number' && (
                callData.numberOfCalls.diff > 0
                  ? <IconTrendingUp />
                  : <IconTrendingDown />
              )}
              {callData?.numberOfCalls?.diff?.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card grid rounded-[8px] !bg-gradient-to-b !from-white !to-white relative">
        <CardHeader className="grid grid-rows-2 items-center gap-2">
          <div className=" row-span-2 flex items-center justify-center bg-[#4ad99234]  w-[60px] h-[60px] rounded-[23px]">
            {/* <IconUsers className="text-gray-700 w-6 h-6" /> */}
            <img className="w-[30px]" src={graph} alt="" />
          </div>
          <CardDescription className="self-end">Total cost</CardDescription>
          <CardTitle className="!text-[20px] md:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {callData?.totalCost?.Cost?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-3 bottom-3">
            <Badge variant="outline" className={`!bg-[#F6F8FC] ${callData?.totalCost?.diff !== undefined &&
              callData.totalCost.diff > 0
              ? 'text-[#20AD22]'
              : callData?.totalCost?.diff !== undefined &&
                callData.totalCost.diff < 0
                ? 'text-[#AD2020]'
                : ''
              }`}>
              {typeof callData?.totalCost?.diff === 'number' && (
                callData.totalCost.diff > 0
                  ? <IconTrendingUp />
                  : <IconTrendingDown />
              )}
              {callData?.totalCost?.diff?.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card grid rounded-[8px] !bg-gradient-to-b !from-white !to-white relative">
        <CardHeader className="grid grid-rows-2 items-center gap-2">
          <div className=" row-span-2 flex items-center justify-center bg-[#ff8f665d]  w-[60px] h-[60px] rounded-[23px]">
            <img className="w-[35px]" src={dollar} alt="" />
            {/* <IconUsers className="text-gray-700 w-6 h-6" /> */}
          </div>
          <CardDescription className="text-nowrap self-end">Average cost per call</CardDescription>
          <CardTitle className="!text-[20px] md:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {callData?.averageCostPerCall?.averageCost?.toFixed(2) ?? 0}
          </CardTitle>
          <CardAction className="absolute right-3 bottom-3">
            <Badge variant="outline" className={`!bg-[#F6F8FC] ${callData?.averageCostPerCall?.diff !== undefined &&
              callData.averageCostPerCall.diff > 0
              ? 'text-[#20AD22]'
              : callData?.averageCostPerCall?.diff !== undefined &&
                callData.averageCostPerCall.diff < 0
                ? 'text-[#AD2020]'
                : ''
              }`}>
              {typeof callData?.averageCostPerCall?.diff === 'number' && (
                callData.averageCostPerCall.diff > 0
                  ? <IconTrendingUp />
                  : <IconTrendingDown />
              )}
              {callData?.averageCostPerCall?.diff?.toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
