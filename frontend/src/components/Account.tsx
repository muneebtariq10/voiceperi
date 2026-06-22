import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardFooter } from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppUser } from "@/AppContext";
interface DecodedToken {
  firstname?: string;
  lastname?: string;
  email?: string;
  sub?: string;
  image?: string;
  deActivateTime?: any;
}

const Account = () => {
  const { user, setUser } = AppUser();
  console.log("user inside accounts to check delete status", user);
  const form = useForm(); // Initialize the form variable
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [currentUserInfo, setCurrentUserInfo] = useState<DecodedToken | null>(
    null
  );
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setconfirm_password] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null); // point_left ref for file input
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // const [user?.deActivateTime, setuser?.deActivateTime] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<
    { hours: number; minutes: number } | string | null
  >(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    const tokenImpersonated = sessionStorage.getItem("authToken");
    if (tokenImpersonated) {
      sessionStorage.removeItem("authToken");
      if (window.opener) {
        window.close();
      } else {
        navigate("/login");
      }
    } else {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("user_id");
      navigate("/login");
    }
  };
  console.log("user?.deActivateTime", user?.deActivateTime);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  const calculateDeactivationTime = () => {
    if (user?.deActivateTime) {
      const deactivationTime = new Date(user?.deActivateTime);
      const now = new Date();
      const diffMs = now.getTime() - deactivationTime.getTime(); // difference in milliseconds
      const totalMsRemaining = 36 * 60 * 60 * 1000 - diffMs; // 36 hours in ms

      if (totalMsRemaining <= 0) {
        return "Your account is already deleted";
      }

      const totalMinutes = Math.floor(totalMsRemaining / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return { hours, minutes };
    }

    return null;
  };

  const onSubmit = async () => {
    const formData = new FormData();
    formData.append("firstname", firstName);
    formData.append("lastname", lastName);
    formData.append("email", email);
    if (password !== "") {
      formData.append("password", password);
    }
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const res = await fetch(`${API_URL}api/users/${userInfo?.sub}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      const result = await res.json();
      setCurrentUserInfo(result);
      setUser(result);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Error updating user info.");
    }
  };
  const handleDeleteAccount = async () => {
    try {
      // Your API call here
      const response = await fetch(
        `${API_URL}api/users/deactivate/${userInfo?.sub}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const message = result?.message;
        toast.success(message);
        result?.timeOfDeletion;
        if (
          result?.timeOfDeletion !== "null" &&
          result?.timeOfDeletion !== null
        ) {
          setTimeout(() => {
            handleLogout();
          }, 3000);
        }
        console.log(result.userInfo, "here is user info after updating");
        setUser(result?.userInfo);
        console.log(user, "inside account global user");
        // Optionally show success toast/redirect
      } else {
        toast.error("Try later , not deleted yet");
        // Optionally show error toast
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // useEffect(() => {

  // }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}api/users/${userInfo?.sub}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = await res.json();
        setCurrentUserInfo(userData);
        calculateDeactivationTime();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub && token) {
      fetchUser();
    }
  }, [userInfo?.sub, token]);

  useEffect(() => {
    if (currentUserInfo) {
      setFirstName(currentUserInfo?.firstname || "");
      setLastName(currentUserInfo?.lastname || "");
    }
    if (currentUserInfo?.email) {
      setEmail(currentUserInfo.email);
    }
  }, [currentUserInfo]);
  useEffect(() => {
    if (user?.deActivateTime) {
      const result = calculateDeactivationTime();
      setCountdown(result);
    }
  }, [user?.deActivateTime]);

  return (
    <div className="w-full flex flex-col md:flex-row items-start justify-between gap-x-11">
      <div className="flex justify-center w-full md:w-fit mb-[20px]">
        <div className="relative justify-self-center">
          <Avatar className="w-[100px] md:w-[160px] h-[100px] md:h-[160px] overflow-hidden rounded-full">
            <AvatarImage
              className="object-cover w-full h-full"
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : currentUserInfo?.image
                  ? currentUserInfo.image.startsWith("http://") ||
                    currentUserInfo.image.startsWith("https://")
                    ? currentUserInfo.image
                    : `${API_URL}${currentUserInfo.image}`
                  : "https://github.com/shadcn.png"
              }
            />

            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={handleImageClick}
            className="absolute bottom-0 right-0 cursor-pointer bg-default-purple text-white p-2 rounded-full shadow-md hover:bg-[#46a79d] hover:opacity-85 transition"
          >
            <Pencil className="w-4 h-4 md:w-8 md:h-8" />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </button>
        </div>
      </div>

      <Card className="w-full border-none shadow-none">
        <CardContent className="px-0 md:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-9"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[20px] items-center justify-start gap-x-12">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-2">
                      <FormLabel className="font-semibold text-lg text-primary">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="w-full h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-2">
                      <FormLabel className="font-semibold text-lg text-primary ">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-2">
                      <FormLabel className="font-semibold text-lg text-primary">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          value={email}
                          // onChange={(e) => setEmail(e.target.value)}
                          placeholder="John@gmail.com"
                          required
                          className="w-full h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-2">
                      <FormLabel className="font-semibold text-lg text-primary">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            field.onChange(e);
                          }}
                          className={`w-full h-10 ${form.formState.errors.password ? 'border-red-500' : ''}`}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-2">
                      <FormLabel className="font-semibold text-lg text-primary">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            field.onChange(e);
                          }}
                          className={`w-full h-10 ${
                            form.formState.errors.password
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {password && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    rules={{
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-y-2">
                        <FormLabel className="font-semibold text-lg text-primary">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            value={confirm_password}
                            onChange={(e) => {
                              setconfirm_password(e.target.value);
                              field.onChange(e);
                            }}
                            className={`w-full h-10 ${
                              form.formState.errors.confirmPassword
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <AlertDialog>
                  <AlertDialogTrigger>
                    {user?.role === "user" && (
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full md:w-fit mb-[10px] md:mb-0 px-5 py-3 font-medium text-lg border-[#CB3126] text-[#CB3126]
                            ${
                              user?.deActivateTime != "null" &&
                              user?.deActivateTime != null
                                ? "border-green-600 text-green-600"
                                : ""
                            } `}
                      >
                        {user?.deActivateTime == "null" ||
                        user?.deActivateTime == null
                          ? "Deactivate Account"
                          : "Reactivate Account"}
                      </Button>
                    )}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user?.deActivateTime == "null" ||
                        user?.deActivateTime == null
                          ? "Deactivate "
                          : " Reactivate Account"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {user?.deActivateTime == "null" ||
                        user?.deActivateTime == null
                          ? "Account can be reactivated in 36 hours otherwise will be permanently deleted. Are you sure you wan to deactivated?"
                          : " Account will be reactivated in with in 5 miniutes"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        {user?.deActivateTime == "null" ||
                        user?.deActivateTime == null
                          ? "Yes, Deactivated"
                          : "Yes Reactivate  "}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex items-center justify-between gap-x-6">
                  <Button
                    type="button"
                    className="px-[50px] py-3 font-medium text-lg text-default-purple border-default-purple"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-[50px] py-3 font-medium text-lg bg-default-purple text-secondary"
                    variant="outline"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          {typeof countdown === "string" ? (
            <p className="text-red-600">{countdown}</p>
          ) : countdown?.hours ? (
            <p className="text-blue-700">
              Your account will be permanently deleted in {countdown.hours}h{" "}
              {countdown.minutes}m
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Account;
