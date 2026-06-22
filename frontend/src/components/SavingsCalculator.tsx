import { useState } from "react";
import logo from '../assets/logo-white.png'

export default function SavingsCalculator() {
  const [csrs, setCsrs] = useState(25);
  const [salary, setSalary] = useState(15);  // Make sure state is set here

  const productiveHoursPerCSR = 1500;
  const productiveHoursDayTalk = 25;
  const currentCostPerHour = 26.67;
  const ehvaCostPerHour = 6.81;

  const savings = csrs * productiveHoursPerCSR * (currentCostPerHour - ehvaCostPerHour);
  const annualSavings = savings.toLocaleString();  // Ensure proper formatting

  return (
    <div className="block lg:flex px-0 md:px-[40px] lg:mx-[100px] gap-4 mt-7">
      {/* Left Side */}
      <div className="space-y-8 w-12/12 lg:w-7/12 p-10 bg-gradient-to-t from-[#d9eeec] via-[#d9eeec] to-white  rounded-[30px]">
        {/* CSR count slider */}
        <div className="mb-20">
          <h2 className="text-[25px] font-semibold mb-5">How many CSR’s do you have?</h2>
            <div className="relative w-full">
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={csrs}
                    onChange={(e) => setCsrs(Number(e.target.value))}
                    className="w-full appearance-none h-4 bg-white rounded-full"
                    style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    }}
                />
                <p
                    className="absolute top-full mt-2 font-normal text-[20px] transition-all"
                    style={{
                    left: `calc(${(csrs - 1) * (100 / 49)}%)`,
                    transform: "translateX(-50%)",
                    }}
                >
                    {csrs}
                </p>
            </div> 
        </div>

        {/* CSR salary slider */}
        <div className="mb-20">
          <h2 className="text-[25px] font-semibold mb-5">What’s your average CSR salary?</h2>
            <div className="relative w-full">
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full appearance-none h-4 bg-white rounded-full"
                    style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                    }}
                />
                <p
                    className="absolute top-full mt-2 font-normal text-[20px] transition-all"
                    style={{
                    left: `calc(${(salary - 1) * (100 / 49)}%)`,
                    transform: "translateX(-50%)",
                    }}
                >
                    {salary}
                </p>
            </div>
        </div>

        {/* Slider thumb styles */}
        <style >{`
            input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 9999px;
            background: white;
            border: 4px solid #46a79d; /* Tailwind's purple-700 */
            cursor: pointer;
            margin-top: -2px;
            }
            input[type='range']::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 9999px;
            background: white;
            border: 4px solid #46a79d;
            cursor: pointer;
            }
        `}</style>

        {/* Static info */}
        <div className="grid grid-cols-2 gap-7 text-sm mt-6">
          <div>
            <p className="text-[18px] font-semibold leading-[100%] text-black mb-6">Productive Hours/Day talk time</p>
            <p className="font-bold text-[50px] text-transparent bg-clip-text bg-gradient-to-b from-[#46a79d] to-[#d9eeec]">{productiveHoursDayTalk}</p>
          </div>
          <div>
            <p className="text-[18px] font-semibold leading-[100%] text-black mb-6">Productive hours/year</p>
            <p className="font-bold text-[50px] text-transparent bg-clip-text bg-gradient-to-b from-[#46a79d] to-[#d9eeec]">{productiveHoursPerCSR}</p>
          </div>
          <div className="mt-4">
            <p className="text-[18px] font-semibold leading-[100%] text-black mb-6">Current cost/productive hour</p>
            <p className="font-bold text-[50px] text-transparent bg-clip-text bg-gradient-to-b from-[#46a79d] to-[#d9eeec]">${currentCostPerHour}</p>
          </div>
          <div className="mt-4">
            <p className="text-[18px] font-semibold leading-[100%] text-black mb-6">EHVA price/productive hour</p>
            <p className="font-bold text-[50px] text-transparent bg-clip-text bg-gradient-to-b from-[#46a79d] to-[#d9eeec]">${ehvaCostPerHour}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Result Card */}
      <div className="rounded-[30px] mt-10 xl:mt-0 bg-gradient-to-t from-[#142073] to-[#020A42] w-12/12 lg:w-5/12 relative overflow-hidden pt-10 h-full ">
        <div className="h-full">
            <p className="text-[25px] font-semibold text-white">Savings</p>
            <h1 className="text-[80px] md:text-[100px] h-auto leading-[100%] font-bold my-2 text-transparent bg-clip-text bg-gradient-to-b from-[#5222FF] to-[#C7B7FF] ">1500</h1>

            <p className="text-[25px] font-semibold text-white">Annual Savings</p>
            <h1 className="text-[80px] md:text-[100px] h-auto leading-[100%] font-bold my-2 text-transparent bg-clip-text bg-gradient-to-b from-[#5222FF] to-[#C7B7FF] ">${annualSavings}</h1>
            
            <p className="mt-4 text-[16px] text-[#C3C3C3] w-95 mx-auto">
            Lorem ipsum dolor sit amet consectetur. Nibh semper diam sed sit posuere quam consectetur. Sed senectus enim est ut lacinia. Eu.
            </p>
        </div>
        
        <div className="h-65 w-full ">
            <div className="bg-gradient-to-t from-[#5222FF] to-[#C7B7FF] w-full  opacity-10 rounded-full aspect-square flex absolute right-0 left-0 bottom-[-32%] md:bottom-[-45%]">
            </div>
            <div className="bg-gradient-to-t from-[#5222FF] to-[#C7B7FF] opacity-10 w-[80%] rounded-full aspect-square mx-auto right-0 left-0 absolute bottom-[-27%] md:bottom-[-40%]">
                
            </div>
            <div className="flex items-center gap-3 right-0 left-0 absolute bottom-[50px] justify-center text-[26.34px] text-white font-semibold"><img className="w-[140px] opacity-100" src={logo} alt="logo" /></div>
        </div>
      </div>
      
    </div>
  );
}
