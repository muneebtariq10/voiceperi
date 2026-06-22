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

    return (
        <Card
            className={`flex md:w-[285px] h-auto flex-col gap-4 border-2 !gradient-to-t !from-[#5222FF] !to-[#fff]  
        ${isFeatured ? "bg-default-purple text-white" : ""} 
        border-gray-200 shadow-md rounded-[12px] p-4`}
        >
            <div className="flex flex-col gap-y-4">
                <CardHeader className="p-0">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className={`text-2xl font-semibold ${isFeatured ? "text-white" : "text-primary"}`}>
                                {title}
                            </CardTitle>
                        </div>
                        {isFeatured && (
                            <Badge className="font-medium text-xs rounded-[8px] bg-[#ffffff] text-primary">
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
                        ${isFeatured ? "border-white bg-white " : " bg-[#b7f4c5] "}`}>
                                <Check className={`w-4 h-4 ${isFeatured ? "text-default-purple" : "text-[#0e9e59]"}`} />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="flex justify-center mt-auto">
                <Link to='/signup'>
                    <Button
                        variant="outline"
                        className={`cursor-pointer rounded-[10px] w-[200px] bg-default-purple text-white ${isFeatured ? "bg-[#8461ff] text-white border-none" : ""}`}
                    >
                        Start Free Trial <ArrowUpRight className='w-6 h-6' />
                    </Button>
                </Link>
            </CardFooter>
        </Card>


    );
}
