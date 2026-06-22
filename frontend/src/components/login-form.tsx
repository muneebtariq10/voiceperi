import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import icon_google from "../assets/google__g__logo1.svg";
import { AuthRightSec } from "./AuthRightSec";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppUser } from "@/AppContext";
import { jwtDecode } from "jwt-decode";
export function LoginForm() {
  const { setUser } = AppUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get("token");

  console.log("token", token);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

    // Clear error for the specific field on input change
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: false }));
    }
  };

  function handleGoogleLogin() {
    setIsLoading(true);
    window.location.href = `${API_URL}api/auth/google/login`;
    console.log("Google login initiated", API_URL);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: !formData.email,
      password: !formData.password,
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setIsLoading(false);
          toast.error(data.message || "Login failed");
          return;
        }

        if (data.access_token) {
          localStorage.setItem("authToken", data.access_token);

          try {
            const decoded: any = jwtDecode(data.access_token);
            const userId = decoded.sub || decoded.id || decoded.userId;

            if (!userId) throw new Error("Invalid token structure");

            const userResponse = await fetch(`${API_URL}api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            });

            if (!userResponse.ok) {
              throw new Error("Failed to fetch user data");
            }

            const userData = await userResponse.json();
            setUser(userData);
            if (userData.verrified === 0) {
              toast.error("Your Sign up process is not completed yet");
              return navigate("/signup");
            }
          } catch (err) {
            console.error("Error decoding token or fetching user:", err);
            toast.error("Failed to load user data");
          }
        }

        setIsLoading(false);
        // if (data.deActivateTime !== "null" && data.deActivateTime !== null) {
        //   toast.success("Your Account is logged in successfully");
        //   navigate("/dashboard/Settings");
        // } else {}
        toast.success("Signed in successfully");
        navigate("/dashboard");
      } catch (error) {
        setIsLoading(false);
        console.error("Error during login:", error);

        toast.error("An error occurred. Please try again.");
      }
    }
  };

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);

  //   const token = params.get("token");
  //   if (token) {
  //     setIsLoading(true);
  //     localStorage.setItem("authToken", token);
  //     toast.success("Signed in successfully");

  //     navigate("/dashboard");
  //   }
  // }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setIsLoading(true);

      // Use sessionStorage instead of localStorage for "login as"
      sessionStorage.setItem("authToken", token);

      toast.success("Signed in successfully");
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className={cn("flex justify-center max-w-3xl md:max-w-7xl mx-auto")}>
      <div
        className={`${
          isLoading ? "flex" : "hidden"
        } absolute w-full h-full bg-white/50 z-10 justify-center items-center`}
      >
        {/* <Loader className={`${isLoading ? 'flex' : 'hidden'} w-[300px] h-[300px] animate-spin  text-muted-foreground`} /> */}
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-[50px] h-[50px] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      <Card className="overflow-hidden p-0 border-none rounded-none shadow-none w-full">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:pl-15 md:py-14 md:pr-36 self-center"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-left text-left">
                <h1 className="text-[38px] font-bold">Log In</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email and password to sign in!
                </p>
              </div>
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                type="button"
                className="w-full cursor-pointer bg-[#F4F7FE] border-none shadow-none py-[20px]"
              >
                <img src={icon_google} />
                <span className="text-[16px] font-semibold">
                  Sign in with Google
                </span>
              </Button>
              <div className="w-2/3 self-center after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  or
                </span>
              </div>
              <div className="grid gap-3">
                <Label
                  htmlFor="email"
                  className={`${errors.email ? "text-red-500" : ""}`}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email id"
                  className={`${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label
                    htmlFor="password"
                    className={`${errors.password ? "text-red-500" : ""}`}
                  >
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${errors.password ? "border-red-500" : ""}`}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="rounded-sm"
                  />
                  <Label htmlFor="remember" className="ml-2 font-normal ">
                    Keep me logged in
                  </Label>
                  <Link
                    to={"/forgot-password"}
                    className="ml-auto text-sm underline-offset-2 hover:underline font-semibold"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full text-[25.07px] font-normal py-6 cursor-pointer"
              >
                Login
              </Button>
              <div className="text-left text-sm">
                Not registered yet?{" "}
                <a
                  href="/signup"
                  className="hover:underline underline-offset-4 font-semibold"
                >
                  Create an Account
                </a>
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
