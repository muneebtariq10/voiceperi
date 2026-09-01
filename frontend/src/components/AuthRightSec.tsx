import { Logo } from './Logo'
import login_bg from '../assets/premium-auth-bg.jpg'

export const AuthRightSec = () => {
  return (
    <div className="content-center justify-items-center bg-center rounded-2xl py-4 sm:py-0 bg-no-repeat bg-cover h-[95vh] relative overflow-hidden" style={{ backgroundImage: `url(${login_bg})` }}>
      {/* Dark overlay to ensure text remains highly legible on the premium background */}
      <div className="absolute inset-0 bg-black/40 z-0 rounded-2xl"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Logo theme="dark" layout="stacked" className="text-5xl sm:text-6xl mb-6" />
        <div className="border-[1px] border-white/20 bg-white/10 backdrop-blur-md text-white px-8 py-4 mt-8 rounded-xl shadow-2xl text-center">
          <p className="text-lg font-medium text-teal-200 uppercase tracking-widest">An AI Based</p>
          <h4 className="sm:text-3xl text-xl font-bold mt-2">Voice Agent Dashboard</h4>
        </div>
      </div>
    </div>
  )
}

