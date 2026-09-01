import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface PaymentPlanProps {
    title: string;
    Monthlyprice: string;
    Yearlyprice: string;
    features: string[];
    isFeatured?: boolean;
    selectedPlan?: string;
}

export default function PaymentPlanCard2({ title, Monthlyprice, Yearlyprice, features, isFeatured, selectedPlan }: PaymentPlanProps) {
    const monthlyPrice = Number(Monthlyprice);
    const isValidPrice = !isNaN(monthlyPrice);
    const payablePrice = isValidPrice
        ? selectedPlan === 'month'
            ? monthlyPrice.toFixed(2)
            : Yearlyprice
        : null;

    return (
        <Card
            className={`flex md:w-[285px] h-auto flex-col gap-4 bg-[var(--bg-surface)] rounded-2xl p-6 transition-all duration-300
        ${isFeatured ? "border-2 border-[var(--teal-500)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] -translate-y-2 relative z-10" : "border border-[var(--border-default)] shadow-sm hover:shadow-md"}`}
        >
            <div className="flex flex-col gap-y-4">
                <CardHeader className="p-0">
                    <div className="flex flex-col items-start gap-y-3 w-full">
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className="text-2xl font-semibold text-[var(--text-primary)]">
                                {title}
                            </CardTitle>
                            {isFeatured && (
                                <Badge className="font-medium text-xs rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] border-none px-3 py-1">
                                    Most Popular
                                </Badge>
                            )}
                        </div>
                        <p className="text-left flex items-baseline gap-x-1">
                            {payablePrice !== null && title !== "Enterprises" ? (
                                <>
                                    <span className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                                        ${payablePrice}
                                    </span>
                                    {selectedPlan && (
                                        <span className="text-[15px] font-medium text-[var(--text-secondary)]">
                                            /{selectedPlan}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                                    Custom
                                </span>
                            )}
                        </p>
                    </div>
                </CardHeader>
            </div>
            
            <div className="w-full h-px bg-[var(--border-default)] my-2" />

            <CardContent className="p-0 flex-grow">
                <ul className="flex flex-col gap-y-3.5">
                    {features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-x-3 text-[15px] text-[var(--text-primary)] leading-tight">
                            <div className="mt-0.5 shrink-0 bg-[var(--teal-50)] rounded-full p-1">
                                <Check className="w-3.5 h-3.5 text-[var(--teal-600)] stroke-[3]" />
                            </div>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="p-0 mt-6 pt-auto">
                <Link to='/signup' className="w-full">
                    <Button
                        variant={isFeatured ? "default" : "outline"}
                        className={`w-full rounded-xl py-6 font-semibold flex items-center justify-center gap-2 group transition-all
                        ${isFeatured 
                            ? "bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white border-none shadow-md hover:shadow-lg" 
                            : "bg-[var(--bg-surface)] hover:bg-[var(--bg-inset)] text-[var(--text-primary)] border-[var(--border-default)]"}`}
                    >
                        Start Free Trial 
                        <ArrowUpRight className={`w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${!isFeatured && "text-[var(--text-secondary)]"}`} />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
