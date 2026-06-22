import { Frown, Meh, Smile } from "lucide-react";

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
    <div className=" h-full rounded-2xl bg-white px-6 py-2 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col items-start ">
        <h2 className="text-[20px] font-semibold text-gray-900">Sentiment analysis</h2>
        <p className="text-sm text-gray-500">Customer sentiments on the call</p>
      </div>

      {/* Sentiment Bar */}
      {/* <div className="mt-10 flex justify-between items-center gap-5">
        <div className={`h-[30px] w-[${negativePercent == 0 ? '1' : negativePercent}%] rounded-[12.72px] bg-[#F27081]`}></div>
        <div className={`h-[30px] w-[${neutralPercent == 0 ? '1' : neutralPercent}%] rounded-[12.72px] bg-[#FEE653]`}></div>
        <div className={`h-[30px] w-[${positivePercent == 0 ? '1' : positivePercent}%] rounded-[12.72px] bg-[#87DB7D]`}></div>
      </div> */}
     <div className="mt-10 flex items-center gap-3 h-[42px] w-full overflow-hidden ">
  {/* Negative */}
  <div
    className="h-full rounded-[12.72px] bg-[#F27081]"
    style={{ width: negative > 0 ? `${negativePercent < 2 ? 2 : negativePercent}%` : '2px' }}
  />

  {/* Neutral */}
  <div
    className="h-full rounded-[12.72px] bg-[#FEE653]"
    style={{ width: neutral > 0 ? `${neutralPercent < 2 ? 2 : neutralPercent}%` : '2px' }}
  />

  {/* Positive */}
  <div
    className="h-full rounded-[12.72px] bg-[#87DB7D]"
    style={{ width: positive > 0 ? `${positivePercent < 2 ? 2 : positivePercent}%` : '2px' }}
  />
</div>


      {/* Sentiment Counts */}
      <div className="mt-5 flex justify-start items-center gap-8">
        {/* Negative */}
        <div className="grid grid-rows-3 justify-items-center items-center gap-1 text-center">
          <p className="font-[500] text-[16px] text-[#64748B]">Negative</p>
          <div className="flex gap-2">
            <Frown className="text-[#F27081]" />
            <span className="text-[#0F1A2A] font-medium">{negative ? negative : 0}</span>
          </div>

        </div>
        {/* Neutral */}
        <div className="grid grid-rows-3 justify-items-center items-center gap-1 text-center">
          <p className="font-[500] text-[16px] text-[#64748B]">Neutral</p>
          <div className="flex gap-2">
            <Meh className="text-[#FEE653]" />
            <span className="text-[#0F1A2A] font-medium">{neutral ? neutral : 0}</span>
          </div>

        </div>
        {/* Positive */}
        <div className="grid grid-rows-3 justify-items-center items-center gap-1 text-center">
          <p className="font-[500] text-[16px] text-[#64748B]">Positive</p>
          <div className="flex gap-2">
            <Smile className="text-[#87DB7D]" />
            <span className="text-[#0F1A2A] font-medium">{positive ? positive : 0}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
