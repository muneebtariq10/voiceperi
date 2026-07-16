import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type Requirement = {
    label: string
    test: (pw: string) => boolean
}

const requirements: Requirement[] = [
    { label: "At least 8 characters", test: pw => pw.length >= 8 },
    { label: "One uppercase letter", test: pw => /[A-Z]/.test(pw) },
    { label: "One lowercase letter", test: pw => /[a-z]/.test(pw) },
    { label: "One number", test: pw => /[0-9]/.test(pw) },
    { label: "One special character", test: pw => /[^A-Za-z0-9]/.test(pw) },
]

function getStrengthLabel(passedCount: number): string {
    if (passedCount <= 2) return "Weak"
    if (passedCount === 3 || passedCount === 4) return "Medium"
    return "Strong"
}

type Props = {
    password: string
    setPassword: (value: string) => void
    showError: boolean
    setShowError: (value: boolean) => void
}

export function PasswordInputWithStrength({
    password,
    setPassword,
    showError,
    setShowError,
}: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const passedRules = requirements.filter(r => r.test(password)).length
    const strengthLabel = getStrengthLabel(passedRules)

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                        const value = e.target.value
                        setPassword(value)
                        if (showError) {
                            setShowError(false)
                        }
                    }}
                    className={showError ? "border-red-500 pr-10" : "pr-10"}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>

            {password && (
                <>
                    <p
                        className={`text-sm font-medium ${strengthLabel === "Strong"
                            ? "text-green-600"
                            : strengthLabel === "Medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        Strength: {strengthLabel}
                    </p>

                    <ul className="text-sm list-disc pl-5 space-y-1">
                        {requirements.map((req, idx) => (
                            <li
                                key={idx}
                                className={`${req.test(password) ? "text-green-600" : "text-red-600"} text-start`}
                            >
                                {req.label}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}
