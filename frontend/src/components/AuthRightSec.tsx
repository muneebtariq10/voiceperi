import logo from '../assets/logo-login.png'
import login_bg from '../assets/bg-image.jpeg'

export const AuthRightSec = () => {
  return (
    <div className="content-center justify-items-center bg-right-top rounded-2xl py-4 sm:py-0 bg-no-repeat bg-cover h-[95vh]" style={{ backgroundImage: `url(${login_bg})` }}>
      <img className="sm:w-[136px] w-[100px]" src={logo} alt="" />
      <div className="sm:text-[53.56px] text-[30px] text-white ">VoicePeri</div>
      <div className="border-[3px] border-[#FFFFFF4D]  text-white px-6 py-2 mt-8 rounded-[10px] border-opacity-10">
        <p className="text-[17.58px]">An AI Based </p>
        <h4 className="sm:text-[29.3px] text-[16px]  mt-4">Voice Agent Dashboard</h4>
      </div>
    </div>
  )
}

