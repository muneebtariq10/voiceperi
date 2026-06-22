import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import back_arrow from '../assets/back_arrow.svg';
import key_icon from '../assets/key_icon.svg';
import { AuthRightSec } from "./AuthRightSec";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function ForgotForm() {
  
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: false,
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error for the specific field on input change
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: !formData.email,
    };

    setErrors(newErrors);

    if (!newErrors.email) {
      try {
        const response = await fetch(`${API_URL}api/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message || "Reset password failed");
          return;
        }

        const data = await response.json();
        navigate(`/email?email=${formData.email}`);
        console.log("Password reset successful:", data);
      } catch (error) {
        console.error("Error during reset password:", error);
      }
    }
  };
  return (
    <div className={cn("flex justify-center max-w-3xl md:max-w-7xl mx-auto")}>
      <Card className="overflow-hidden p-0 border-none rounded-none shadow-none w-full">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:pl-15 md:py-14 md:pr-36 self-center">
            <div className="flex flex-col gap-6">
              <div className="p-2 bg-[#F7F5FF] w-[40px] rounded-full">
                <img src={key_icon} alt="" className="w-full" />
              </div>
              <div className="flex flex-col items-left text-left">
                <h1 className="text-[38px] font-bold">Forgot Password</h1>
                <p className="text-muted-foreground text-balance">
                  No Worries, we’ll send you reset instructions
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className={`${errors.email ? 'text-red-500' : ''}`}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email id"
                  className={`${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              <Button type="submit" className="w-full text-[25.07px] font-normal py-6 cursor-pointer">
                Reset Password
              </Button>
              <div className="text-left text-sm">
                <Link to='/login' className="hover:underline underline-offset-4 font-semibold flex">
                  <img src={back_arrow} alt="" className="pr-2 w-[24px]" />
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
  );
}
