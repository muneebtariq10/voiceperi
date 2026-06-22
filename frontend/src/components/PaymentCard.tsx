import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PaymentPlanProps {
    title: string;
    Monthlyprice: string;
    planType: string;
    Yearlyprice: string;
    features: string[];
    isActive: boolean;
    isFeatured?: boolean;
    selectedPlan?: string;
    onSelect: () => void;
}

export default function PaymentPlanCard({ title, Monthlyprice, Yearlyprice, features, isActive, isFeatured, selectedPlan, planType, onSelect }: PaymentPlanProps) {
    // const [amount, duration] = price.includes("/")
    //     ? price.split("/")
    //     : [price, ""];

    const monthlyPrice = Number(Monthlyprice);
    const isValidPrice = !isNaN(monthlyPrice);
    const payablePrice = isValidPrice
        ? selectedPlan === 'month'
            ? monthlyPrice.toFixed(2)
            : Yearlyprice
        : null;

    //console.log('payablePrice', typeof (payablePrice))
    return (
        <Card
            className={`flex w-full md:w-[285px] h-auto flex-col gap-4 border-2  
        ${isFeatured ? "bg-default-purple text-white" : ""} 
        ${isActive ? "shadow-lg " : "border-gray-200 shadow-md"} 
        rounded-[12px] p-4`}
        >
            <div className="flex flex-col gap-y-4">
                <CardHeader className="p-0">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className={`text-2xl font-semibold ${isFeatured ? "text-white" : "text-primary"}`}>
                                {title}
                            </CardTitle>
                            {isActive && planType === selectedPlan && (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center 
                                 ${isFeatured ? "bg-white text-default-purple" : "bg-default-purple text-white"}`}>
                                    <Check className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        {/* Display 'Most Popular' badge when the plan is featured, even if it's active */}
                        {isFeatured && (
                            <Badge className="font-medium text-xs rounded-[8px] bg-[#ffffff] text-primary ml-2">
                                Most Popular
                            </Badge>
                        )}
                    </div>


                    <hr />
                    <p className="text-left">
                        {payablePrice !== null && title !== "Enterprises" ? (
                            <>
                                <span className={`text-[26px] font-semibold ${isFeatured ? "text-white" : "text-primary"}`}>
                                    ${payablePrice}
                                </span>
                                {selectedPlan && (
                                    <span className={`text-xl font- ${isFeatured ? "text-white" : "text-default-gray"}`}>
                                        /{selectedPlan}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className={`text-[26px] font-semibold ${isFeatured ? "text-white" : "text-primary"}`}>
                                Custom Pricing
                            </span>
                        )}
                    </p>

                </CardHeader>
            </div>

            <CardContent className="p-0 mt-4">
                <ul className="flex flex-col gap-y-4 text-nowrap">
                    {features?.map((feature, index) => (
                        <li key={index} className="flex items-center gap-x-2">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 
                        ${isFeatured ? "border-white bg-white" : " bg-"}`}>
                                <Check className={`w-4 h-4 ${isFeatured ? "text-primary" : ""}`} />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="flex justify-center mt-auto">
                <Button
                    onClick={title === "Enterprises" || (isActive && planType === selectedPlan) ? undefined : onSelect}
                    variant={isActive ? "default" : "outline"}
                    className={`cursor-pointer w-[200px] rounded-[10px]
                ${isActive && planType === selectedPlan ? "bg-secondary text-primary hover:bg-secondary" : "bg-default-purple text-white hover:bg-blue-700 hover:text-white"}  
                ${isFeatured ? "bg-[#8461ff] text-white border-none hover:bg-[#6F4BE6]" : ""}`}
                >
                    {isActive && planType === selectedPlan ? "Current Plan" : "Choose Plan"}
                </Button>
            </CardFooter>
        </Card>


    );
}
