import { useEffect, useState } from 'react';
import PaymentPlanCard2 from './PaymentCard2';
import { ToggleGroup, ToggleGroupItem } from '@radix-ui/react-toggle-group';
import { cn } from '../lib/utils';

type Prices = {
    id: number;
    type: 'month' | 'year';
    price: string;
    stripe_price_id: string;
    discount_type: string;
    discount: string | null;
};

type Features = {
    minutes: number;
    crm_integration: boolean;
    price_per_minute: number | null;
    appointment_links: boolean;
    zapier_integration: boolean;
    smart_spam_detection: boolean;
    advance_call_transfer: boolean;
    custom_agent_training: boolean;
    advance_appointment_booking: boolean;
};

type Plan = {
    id: number;
    title: string;
    features: Features;
    stripe_product_id: string;
    is_popular: boolean;
    pricings: Prices[];
};
const Pricing = () => {
    const [selectedPlan, setSelectedPlan] = useState("month");
    const [plans, setPlans] = useState<Plan[]>([]);
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const getDiscountedPrice = (pricing: {
        price: string;
        discount?: string | number | null;
        discount_type?: 'percentage' | 'value';
    }): string => {
        const basePrice = parseFloat(pricing.price);
        if (isNaN(basePrice)) return "N/A";

        const discountValue = pricing.discount != null ? Number(pricing.discount) : 0;

        if (pricing.discount_type === "percentage") {
            return (basePrice * (1 - discountValue / 100)).toFixed(2);
        } else if (pricing.discount_type === "value") {
            return Math.max(basePrice - discountValue, 0).toFixed(2);
        }

        return basePrice.toFixed(2);
    };
    const sortedPlans = [...plans]
        .filter(plan => plan.title !== 'Free Trial') // Exclude Free Trial
        .sort((a, b) => {
            // Push "Enterprise" plan to the end
            if (a.title === 'Enterprise') return 1;
            if (b.title === 'Enterprise') return -1;

            // Extract monthly prices for comparison
            const aMonthly = parseFloat(a.pricings.find(p => p.type === 'month')?.price ?? '') || Infinity;
            const bMonthly = parseFloat(b.pricings.find(p => p.type === 'month')?.price ?? '') || Infinity;

            return aMonthly - bMonthly;
        });
    useEffect(() => {
        fetch(`${API_URL}api/payment-plans`)
            .then((response) => response.json())
            .then((data) => {
                setPlans(data)
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, [API_URL]);
    return (
        <section id="pricing" className='md:px-[100px] py-[40px] md:py-[80px] container mx-auto'>
            <div className='flex flex-col gap-y-6 '>
                <div className='w-full block md:flex items-center md:justify-between '>
                    <div className='flex flex-col gap-y-1 items-center md:items-start'>
                        <h3 className='text-[30px] md:text-[50px] font-bold text-left text-primary'>Our Pricing Plan</h3>
                        <p className='text-lg font-normal text-left text-default-gray'>CLorem ipsum dolor sit amet consectetur. </p>
                    </div>
                    <ToggleGroup
                        type="single"
                        value={selectedPlan}
                        onValueChange={(value) => value && setSelectedPlan(value)}
                        className="flex items-center bg-gray-200 rounded-full w-fit mt-[10px] md:mt-0 "
                    >
                        {/* Monthly Button */}
                        <ToggleGroupItem
                            value="month"
                            className={cn(
                                "px-8 py-2.5 text-[16px] font-bold rounded-full transition-all duration-300",
                                selectedPlan === "month" ? "bg-default-purple text-white" : "text-default-gray"
                            )}
                        >
                            Monthly
                        </ToggleGroupItem>

                        {/* Yearly Button */}
                        <ToggleGroupItem
                            value="year"
                            className={cn(
                                "px-8 py-2.5 text-[16px] font-normal rounded-full transition-all duration-300",
                                selectedPlan === "year" ? "bg-[#46a79d] text-white" : ""
                            )}
                        >
                            Yearly <span className=" text-xs font-normal">-20% off</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch px-3">
                    {sortedPlans?.map((plan, index) => {
                        const isLast = index === sortedPlans.length - 1;
                        //const hasPricing = plan.pricings && plan.pricings.length > 0;

                        const featureList = Object.entries(plan.features)
                            .filter(([key, value]) => {
                                console.log(key);
                                if (typeof value === 'boolean') return value;
                                if (typeof value === 'number') return value > 0;
                                return false;
                            })
                            .map(([key, value]) => {
                                if (typeof value === 'number') {
                                    if (key === 'minutes' && selectedPlan === 'month') {
                                        if (plan.title === 'Enterprises') return '1000+ Minutes';
                                        return `${value} Minutes`;
                                    }
                                    if (key === 'minutes' && selectedPlan === 'year') {
                                        if (plan.title === 'Enterprises') return '1000+ Minutes per month';
                                        return `${value} Minutes per month`;
                                    }
                                    if (key === 'price_per_minute') return `Then $${value} Per Minute`;
                                }

                                return key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, c => c.toUpperCase());
                            });

                        const monthlyPricing = plan.pricings.find(p => p.type === "month") || plan.pricings[0];
                        const yearlyPricing = plan.pricings.find(p => p.type === "year");

                        // Ensure monthlyPricing exists before accessing its properties
                        const discountType = monthlyPricing?.discount_type;
                        const validDiscountType = discountType === 'percentage' || discountType === 'value'
                            ? discountType
                            : undefined;

                        // Handle missing pricing properly
                        const finalMonthlyPrice = monthlyPricing ? getDiscountedPrice({
                            price: monthlyPricing.price,
                            discount: monthlyPricing.discount ? Number(monthlyPricing.discount) : undefined,
                            discount_type: validDiscountType,
                        }) : "N/A";

                        // Similarly handle yearly pricing
                        const finalYearlyPrice = yearlyPricing ? getDiscountedPrice({
                            price: yearlyPricing.price,
                            discount: yearlyPricing.discount ? Number(yearlyPricing.discount) : undefined,
                            discount_type: validDiscountType,
                        }) : "N/A";
                        return (
                            <PaymentPlanCard2
                                key={plan.id}
                                title={plan.title}
                                Monthlyprice={finalMonthlyPrice}
                                Yearlyprice={finalYearlyPrice}
                                features={featureList}
                                isFeatured={plan.is_popular}
                                {...(!isLast && { selectedPlan })}
                            />
                        );
                    })}


                </div>
            </div>
        </section>

    )
}

export default Pricing