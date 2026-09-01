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
            <div className='flex flex-col gap-y-10'>
                <div className='w-full flex flex-col md:flex-row items-center justify-between gap-y-6'>
                    <div className='flex flex-col gap-y-3 items-center md:items-start text-center md:text-left'>
                        <h2 className='text-3xl md:text-4xl font-bold text-[var(--text-primary)]'>Our Pricing Plan</h2>
                        <p className='text-[15px] font-normal text-[var(--text-secondary)] max-w-lg'>Choose a plan that scales with your business needs. No hidden fees.</p>
                    </div>
                    <ToggleGroup
                        type="single"
                        value={selectedPlan}
                        onValueChange={(value) => value && setSelectedPlan(value)}
                        className="flex items-center bg-[var(--bg-inset)] p-1.5 rounded-full w-fit border border-[var(--border-default)]"
                    >
                        {/* Monthly Button */}
                        <ToggleGroupItem
                            value="month"
                            className={cn(
                                "px-6 py-2 text-[15px] rounded-full transition-all duration-200",
                                selectedPlan === "month" 
                                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold" 
                                    : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50"
                            )}
                        >
                            Monthly
                        </ToggleGroupItem>

                        {/* Yearly Button */}
                        <ToggleGroupItem
                            value="year"
                            className={cn(
                                "px-6 py-2 text-[15px] rounded-full transition-all duration-200 flex items-center gap-x-2",
                                selectedPlan === "year" 
                                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold" 
                                    : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50"
                            )}
                        >
                            Yearly 
                            <span className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full transition-colors",
                                selectedPlan === "year" ? "bg-[var(--teal-100)] text-[var(--teal-700)]" : "bg-[var(--teal-50)] text-[var(--teal-600)]"
                            )}>
                                Save 20%
                            </span>
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