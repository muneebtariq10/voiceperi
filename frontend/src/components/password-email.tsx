import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import back_arrow from '../assets/back_arrow.svg'
import mail_icon from '../assets/mail_icon.svg'
import { AuthRightSec } from "./AuthRightSec"
import { Link, useLocation } from "react-router-dom"

export function PasswordEmail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email");
  return (
    <div className={cn("flex justify-center max-w-3xl md:max-w-7xl mx-auto")} >
      <Card className="overflow-hidden p-0 border-none rounded-none shadow-none w-full ">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form className="p-6 md:pl-15 md:py-14 md:pr-36 self-center">
            <div className="flex flex-col gap-6">
              <div className="p-2 bg-[#F7F5FF] w-[40px] rounded-full">
                <img src={mail_icon} alt="" className="w-full  " />
              </div>
              <div className="flex flex-col items-left text-left">
                <h1 className="text-[38px] font-bold">Email Sent</h1>
                <p className="text-muted-foreground text-balance">
                    We sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
              </div>
              <div className="text-left text-sm">
              Didn’t receive the email??{" "} 
                <a href="#" className="hover:underline underline-offset-4 font-semibold">
                Click to Resend
                </a>
              </div>
              <div className="text-left text-sm ">
              <Link to={'/login'} className="hover:underline underline-offset-4 font-semibold flex">
                <img src={back_arrow} alt="" className="pr-2 w-[24px]"/>
                Back to Login
                </Link>
              </div>
            </div>
          </form>
          {/* right image section */}
          <AuthRightSec />
          {/* right image section end */}
        </CardContent>
      </Card>
    </div>
  )
}
