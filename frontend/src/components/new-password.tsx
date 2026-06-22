import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import back_arrow from '../assets/back_arrow.svg';
import key_icon from '../assets/key_icon.svg';
import { AuthRightSec } from "./AuthRightSec";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function NewPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });


  const [errors, setErrors] = useState({
    password: false,
    confirmPassword: false,
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("id");



  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      password: formData.password.length < 8,
      confirmPassword: formData.confirmPassword !== formData.password,
    };

    setErrors(newErrors);


    if (!newErrors.password && !newErrors.confirmPassword) {
      try {
        const response = await fetch(`${API_URL}api/auth/${userId}/reset-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(result.message || "Something went wrong.");
          return;
        }

        console.log("Password reset successful");
        alert("Password reset successful");
        navigate("/login");

      } catch (error) {
        console.error("Reset error:", error);

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
                <h1 className="text-[38px] font-bold">New Password</h1>
                <p className="text-muted-foreground text-balance">
                  Setup new password
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password" className={`${errors.password ? 'text-red-500' : ''}`}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${errors.password ? 'border-red-500' : ''}`}
                />
                <p className={` text-muted-foreground text-balance text-left`}>
                  Must be at least 8 characters
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className={`${errors.confirmPassword ? 'text-red-500' : ''}`}>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm text-start">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" className="w-full text-[25.07px] font-normal py-6 cursor-pointer">
                Reset Password
              </Button>
              <div className="text-left text-sm">
                <Link to={'/login'} className="hover:underline underline-offset-4 font-semibold flex">
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
