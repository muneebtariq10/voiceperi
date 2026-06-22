import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import green_icon from '../assets/green_circle-tick.svg'
import { AuthRightSec } from "./AuthRightSec"

export function PasswordReset() {
  
  return (
    <div className={cn("flex justify-center max-w-3xl md:max-w-7xl mx-auto")} >
      <Card className="overflow-hidden p-0 border-none rounded-none shadow-none w-full ">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form className="p-6 md:pl-15 md:py-14 md:pr-36 self-center">
            <div className="flex flex-col gap-6 items-center">
              <div className="p-2 bg-[#F4FFF4] w-[50px] rounded-full">
                <img src={green_icon} alt="" className="w-full  " />
              </div>
              <div className="flex flex-col items-left text-center">
                <h1 className="text-[38px] font-bold">Password Reset</h1>
                <p className="text-muted-foreground text-balance">
                  Your password has been successfully reset.<br />
                  Click below to login.
                </p>
              </div>
              <Button type="submit" className="w-full text-[25.07px] font-normal py-6 cursor-pointer">
                Login
              </Button>
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
