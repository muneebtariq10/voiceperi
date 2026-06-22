import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Plan } from "@/components/PlanAndBilling";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import PaymentPlanCard3 from "@/components/PaymentPlanCard3";
import { toast } from "sonner";

const Plans = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("month");
  const navigate = useNavigate();

  const handleCreatePlan = () => {
    navigate("/dashboard/create-plan");
  };
  useEffect(() => {
    fetch(`${API_URL}api/payment-plans`)
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [API_URL]);
  console.log(plans);
  const getDiscountedPrice = (pricing: {
    price: string;
    discount?: string | number | null;
    discount_type?: "percentage" | "value";
  }): string => {
    const basePrice = parseFloat(pricing.price);
    if (isNaN(basePrice)) return "N/A";

    const discountValue =
      pricing.discount != null ? Number(pricing.discount) : 0;

    if (pricing.discount_type === "percentage") {
      return (basePrice * (1 - discountValue / 100)).toFixed(2);
    } else if (pricing.discount_type === "value") {
      return Math.max(basePrice - discountValue, 0).toFixed(2);
    }

    return basePrice.toFixed(2);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}api/payment-plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Plan deleted successfully");
      // Optimistically update UI
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      // Optionally show toast
    }
  };

  const sortedPlans = [...plans].sort((a, b) => {
    // Push "Enterprise" plan to the end
    if (a.title === "Enterprises") return 1;
    if (b.title === "Enterprises") return -1;

    // Extract monthly prices for comparison
    const aMonthly =
      parseFloat(a.pricings.find((p) => p.type === "month")?.price ?? "") ||
      Infinity;
    const bMonthly =
      parseFloat(b.pricings.find((p) => p.type === "month")?.price ?? "") ||
      Infinity;

    return aMonthly - bMonthly;
  });
  return (
    <div className="bg-secondary w-full px-3 py-1.5">
      <div className="w-full flex flex-col items-center justify-start bg-white shadow-md gap-[60px] rounded-[30px] px-4 py-6">
        <Card className="w-full max-w-[400px] bg-white text-white shadow-2xl rounded-[20px] border border-gray-200">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <h1 className="text-[26px] font-extrabold text-primary text-center">
              Add New Plans
            </h1>

            <button
              className="flex items-center gap-2 cursor-pointer text-[18px] px-6 py-3 text-white bg-default-purple font-semibold rounded-[30px] shadow-md hover:bg-[#46a79d] transition-all duration-300 transform hover:scale-105"
              onClick={handleCreatePlan}
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </CardContent>
        </Card>
        <div
          id="payment-plans"
          className="w-full flex flex-col justify-center gap-y-6"
        >
          <div className="w-full flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <h3 className="text-2xl font-semibold text-left text-primary">
                Subscription Plans
              </h3>
              <p className="text-sm font-medium text-left text-default-gray">
                Following are the existing plans
              </p>
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
                  "px-8 py-2.5 text-[16px] font-bold rounded-full transition-all duration-300 cursor-pointer",
                  selectedPlan === "month"
                    ? "bg-default-purple text-white"
                    : "text-default-gray"
                )}
              >
                Monthly
              </ToggleGroupItem>

              {/* Yearly Button */}
              <ToggleGroupItem
                value="year"
                className={cn(
                  "px-8 py-2.5 text-[16px] font-normal rounded-full transition-all duration-300 cursor-pointer",
                  selectedPlan === "year" ? "bg-[#46a79d] text-white" : ""
                )}
              >
                Yearly <span className=" text-xs font-normal">-20% off</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center items-stretch">
            {sortedPlans?.map((plan, index) => {
              const isLast = index === sortedPlans.length - 1;
              //const hasPricing = plan.pricings && plan.pricings.length > 0;

              const featureList = Object.entries(plan.features)
                .filter(([key, value]) => {
                  console.log(key);
                  if (typeof value === "boolean") return value;
                  if (typeof value === "number") return value > 0;
                  return false;
                })
                .map(([key, value]) => {
                  if (typeof value === "number") {
                    if (key === "minutes" && selectedPlan === "month") {
                      if (plan.title === "Enterprises") return "1000+ Minutes";
                      return `${value} Minutes`;
                    }
                    if (key === "minutes" && selectedPlan === "year") {
                      if (plan.title === "Enterprises")
                        return "1000+ Minutes per month";
                      return `${value} Minutes per month`;
                    }
                    if (key === "price_per_minute")
                      return `Then $${value} Per Minute`;
                  }

                  return key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                });

              const monthlyPricing =
                plan.pricings.find((p) => p.type === "month") ||
                plan.pricings[0];
              const yearlyPricing = plan.pricings.find(
                (p) => p.type === "year"
              );

              // Ensure monthlyPricing exists before accessing its properties
              const discountType = monthlyPricing?.discount_type;
              const validDiscountType =
                discountType === "percentage" || discountType === "value"
                  ? discountType
                  : undefined;

              // Handle missing pricing properly
              const finalMonthlyPrice = monthlyPricing
                ? getDiscountedPrice({
                    price: monthlyPricing.price,
                    discount: monthlyPricing.discount
                      ? Number(monthlyPricing.discount)
                      : undefined,
                    discount_type: validDiscountType,
                  })
                : "N/A";

              // Similarly handle yearly pricing
              const finalYearlyPrice = yearlyPricing
                ? getDiscountedPrice({
                    price: yearlyPricing.price,
                    discount: yearlyPricing.discount
                      ? Number(yearlyPricing.discount)
                      : undefined,
                    discount_type: validDiscountType,
                  })
                : "N/A";

              return (
                <PaymentPlanCard3
                  id={plan.id}
                  key={plan.id}
                  title={plan.title}
                  Monthlyprice={finalMonthlyPrice}
                  Yearlyprice={finalYearlyPrice}
                  features={featureList}
                  isFeatured={plan.is_popular}
                  onDelete={handleDelete} // ✅ Pass it here
                  {...(!isLast && { selectedPlan })}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
