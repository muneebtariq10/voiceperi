import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, PhoneCall, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GetStarted = () => {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[80vh] flex flex-col items-center justify-center -mt-8">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Welcome to VoicePeri
        </h1>
        <p className="text-base text-gray-500 font-medium">
          Follow these three simple steps to get your AI voice agent up and running in minutes.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 w-full">
        {/* Step 1 */}
        <div className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white rounded-2xl flex flex-col justify-between p-6">
          <div className="flex-grow flex flex-col mb-6">
            <div className="flex justify-between items-start mb-5 w-full">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <Bot className="w-6 h-6" />
              </div>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-xs">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Create Your Agent</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed text-center">
              Choose a distinct voice, specify the language, and give a memorable name to your AI.
            </p>
          </div>
          <div>
            <Link to="/dashboard/voiceAgent" className="block w-full">
              <Button className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-0 shadow-none font-semibold transition-colors duration-300 py-4 rounded-xl">
                Configure Agent <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white rounded-2xl flex flex-col justify-between p-6">
          <div className="flex-grow flex flex-col mb-6">
            <div className="flex justify-between items-start mb-5 w-full">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <Settings className="w-6 h-6" />
              </div>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-xs">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Business Info</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed text-center">
              Equip your agent with knowledge about your specific services, FAQs, and business hours.
            </p>
          </div>
          <div>
            <Link to="/dashboard/businessInformation" className="block w-full">
              <Button className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-0 shadow-none font-semibold transition-colors duration-300 py-4 rounded-xl">
                Update Info <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white rounded-2xl flex flex-col justify-between p-6">
          <div className="flex-grow flex flex-col mb-6">
            <div className="flex justify-between items-start mb-5 w-full">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-bold text-xs">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Test Calls</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed text-center">
              Try calling your new AI agent to test the conversational flow and experience it firsthand.
            </p>
          </div>
          <div>
            <Link to="/dashboard/callHistory" className="block w-full">
              <Button className="w-full bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border-0 shadow-none font-semibold transition-colors duration-300 py-4 rounded-xl">
                View History <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GetStarted