import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import icon_google from "../assets/google__g__logo1.svg";
import { PasswordInputWithStrength } from "./PasswordInputWithStrength";
type Step3Props = {
  formData: {
    name: string;
    email: string;
    password: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      confirm: boolean;
    }>
  >;
  errors: Partial<Record<"name" | "email" | "password", boolean>>;
  setErrors: React.Dispatch<
    React.SetStateAction<
      Partial<Record<"name" | "email" | "password", boolean>>
    >
  >;
  handleGoogleLogin: () => void;
};

export const Step3 = ({
  handleGoogleLogin,
  formData,
  setFormData,
  errors,
  setErrors,
}: Step3Props) => {
  console.log("Form Data:", formData);

  return (
    <>
      <div className="flex flex-col items-left text-left">
        <h1 className="text-[38px] font-bold">Sign Up</h1>
        <p className="text-muted-foreground text-balance">
          Enter your details to sign up
        </p>
      </div>

      <div className="mt-3 justify-items-center">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          type="button"
          className="cursor-pointer bg-[#F4F7FE] border-none shadow-none py-[20px]"
        >
          <img src={icon_google} />
          <span className="text-[16px] font-semibold">Sign up with Google</span>
        </Button>
        <div className="w-2/4 mt-1 self-center after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            or
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="grid gap-3 mt-3">
        <Label
          htmlFor="name"
          className={`${errors.name ? "text-red-500" : ""}`}
        >
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            const { value } = e.target;
            setFormData((prev) => ({ ...prev, name: value }));
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: false }));
            }
          }}
          placeholder='Enter your name "Jhon Adams"'
          className={`${errors.name ? "border-red-500" : ""}`}
          required
        />
      </div>

      {/* Email */}
      <div className="grid gap-3 mt-3">
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
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: false }));
            }
          }}
          placeholder="Enter your email id"
          className={`${errors.email ? "border-red-500" : ""}`}
          required
        />
      </div>

      {/* Password */}
      <div className="grid gap-3 mt-3">
        <Label
          htmlFor="password"
          className={`${errors.password ? "text-red-500" : ""}`}
        >
          Password
        </Label>
        {/* <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                        if (errors.password) {
                            setErrors((prev) => ({ ...prev, password: false }));
                        }
                    }}
                    placeholder="Enter your password"
                    className={`${errors.password ? "border-red-500" : ""}`}
                    required
                /> */}
        <PasswordInputWithStrength
          password={formData.password}
          setPassword={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          showError={errors.password ?? false}
          setShowError={(val) =>
            setErrors((prev) => ({ ...prev, password: val }))
          }
        />

        <p
          className={`${
            errors.password ? "flex" : "hidden"
          } text-red-500 text-[14px] `}
        >
          Password must be 8 character
        </p>
      </div>
    </>
  );
};
