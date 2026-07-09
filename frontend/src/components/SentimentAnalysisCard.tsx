import { Frown, Meh, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function SentimentAnalysisCard({ data }: { data: string[] }) {

  console.log(data);
  const positive = data?.filter(data => data === 'Positive').length
  const negative = data?.filter(data => data === 'Negative').length
  const neutral = data?.filter(data => data === 'Neutral').length
  console.log('positive', positive);
  const total = positive + negative + neutral;

  // Calculate percentages (fallback to 0 if total is 0 to avoid NaN)
  const positivePercent = total ? (positive / total) * 100 : 0;
  const negativePercent = total ? (negative / total) * 100 : 0;
  const neutralPercent = total ? (neutral / total) * 100 : 0;

  return (
    <div className="h-full rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">Sentiment analysis</h2>
        <p className="text-[14px] text-gray-500 font-medium">Customer sentiments on the call</p>
      </div>

      {/* Sentiment Bar */}
      <TooltipProvider>
        <div className="mt-8 flex items-center gap-2 h-[32px] w-full overflow-visible">
          {/* Negative */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full rounded-full bg-rose-400 transition-all duration-500 cursor-pointer"
                style={{ width: negative > 0 ? `${negativePercent < 2 ? 2 : negativePercent}%` : '4px' }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-white border text-gray-900 shadow-md">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Negative</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-400"></div> value <span className="ml-4 font-mono">{negative ? negative : 0}</span></span>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Neutral */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500 cursor-pointer"
                style={{ width: neutral > 0 ? `${neutralPercent < 2 ? 2 : neutralPercent}%` : '4px' }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-white border text-gray-900 shadow-md">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Neutral</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-400"></div> value <span className="ml-4 font-mono">{neutral ? neutral : 0}</span></span>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Positive */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500 cursor-pointer"
                style={{ width: positive > 0 ? `${positivePercent < 2 ? 2 : positivePercent}%` : '4px' }}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-white border text-gray-900 shadow-md">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Positive</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-400"></div> value <span className="ml-4 font-mono">{positive ? positive : 0}</span></span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Sentiment Counts */}
      <div className="mt-8 flex justify-between items-center px-2">
        {/* Negative */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-[13px] text-gray-500 uppercase tracking-wider">Negative</p>
          <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full">
            <Frown className="w-5 h-5 text-rose-500" />
            <span className="text-gray-900 font-bold">{negative ? negative : 0}</span>
          </div>
        </div>
        {/* Neutral */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-[13px] text-gray-500 uppercase tracking-wider">Neutral</p>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
            <Meh className="w-5 h-5 text-amber-500" />
            <span className="text-gray-900 font-bold">{neutral ? neutral : 0}</span>
          </div>
        </div>
        {/* Positive */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-[13px] text-gray-500 uppercase tracking-wider">Positive</p>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
            <Smile className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-900 font-bold">{positive ? positive : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
