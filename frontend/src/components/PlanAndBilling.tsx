import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  ArrowDown,
  ArrowRight,
  ChevronsUpDown,
  DownloadCloud,
  Eye,
  FileType,
} from "lucide-react";
import SearchInput from "./search";
import Filter from "./filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import PaymentPlanCard from "./PaymentCard";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import axios from "axios";
export type Pricing = {
  id: number;
  type: "month" | "year";
  price: string;
  stripe_price_id: string;
  discount_type: string;
  discount: string | null;
};

export type Features = {
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
export interface Invoice {
  id: number;
  invoice: string;
  current_period_start: string;
  amount: string;
  paymentPlan?: {
    title?: string;
  };
  invoice_url: string;
  invoice_pdf_url: string;
  stripe_customer_id?: string;
}
export type Plan = {
  id: number;
  title: string;
  features: Features;
  stripe_product_id: string;
  is_popular: boolean;
  pricings: Pricing[];
};
interface DecodedToken {
  firstname?: string;
  email?: string;
  sub?: string;
  // add any custom fields your token includes
}
const PlanAndBilling = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [pageIndex, setPageIndex] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [subscribedPlan, setSubscribedPlan] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [Price, setPrice] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const pageSize = 7;
  const [selectedPlan, setSelectedPlan] = useState("month");
  const [activePlan, setActivePlan] = useState("");
  const [planType, setplanType] = useState("");
  const [Invoices, setInvoices] = useState<Invoice[]>([]);
  const progressPercentage = (usedMinutes / totalMinutes) * 100;
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice",
      header: ({ column }) => {
        return (
          <div
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-lg font-medium">Invoices</span>
            <ChevronsUpDown className="h-[13px] w-[13px]" />
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-x-3.5">
            <FileType className="w-6 h-6 text-primary cursor-pointer" />
            <span className="text-lg font-medium">
              Invoice {row.getValue("invoice")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: ({ column }) => {
        return (
          <div
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-lg font-medium">Plan</span>
            <ChevronsUpDown className="h-[13px] w-[13px]" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("plan")} Plan</div>
      ),
    },
    {
      accessorKey: "billingDate",
      header: ({ column }) => {
        return (
          <div
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className="flex items-center justify-between gap-x-3.5">
              <span className="text-lg font-medium">Billing Date</span>
              <ArrowDown className="w-5 h-5" />
            </div>
            <ChevronsUpDown className="h-[13px] w-[13px]" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-lg font-normal">{row.getValue("billingDate")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-lg font-medium">Amount</span>
            <ChevronsUpDown className="h-[13px] w-[13px]" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-lg font-normal">USD ${row.getValue("amount")}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invoiceUrl = row.original.invoice_url;
        const invoicePdfUrl = row.original.invoice_pdf_url;

        return row.original.paymentPlan?.title === "Free Trial" &&
          !row.original.stripe_customer_id ? null : (
          <div className="flex items-center gap-4">
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-gray-300 rounded-[8px] cursor-pointer hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-primary" />
            </a>
            <a
              href={invoicePdfUrl}
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              download
              className="p-2 border border-gray-300 rounded-[8px] cursor-pointer hover:bg-gray-100"
            >
              <DownloadCloud className="w-4 h-4 text-primary" />
            </a>
          </div>
        );
      },
    },
  ];
  const table = useReactTable({
    data: Invoices.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: Math.ceil(Invoices.length / pageSize),
  });
  const downloadAllInvoices = (invoices: Invoice[], delayMs: number = 1000) => {
    invoices.forEach((invoice, index) => {
      // Skip if URL is missing or invalid
      if (!invoice.invoice_pdf_url) return;

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = invoice.invoice_pdf_url;
        link.download = `invoice-${index + 1}.pdf`;
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * delayMs);
    });
  };

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
  let stripePromise: Promise<Stripe | null>;
  function getStripe() {
    if (!stripePromise) {
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        throw new Error(
          "Stripe publishable key is not defined in the environment variables."
        );
      }
      stripePromise = loadStripe(stripeKey);
    }
    return stripePromise;
  }
  const handleCheckout = async (planId: number, selectedPlan: string) => {
    try {
      const stripe = await getStripe();
      const response = await axios.post(
        `${API_URL}api/payment-plans/create-checkout-session/${planId}`,
        { selectedPlan, userId: userInfo?.sub }
      );

      const sessionId = response.data.id;

      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId });
        if (result.error) {
          console.error(result.error.message);
        }
      } else {
        console.error("Stripe instance is null");
      }
    } catch (error) {
      console.error("Error during checkout", error);
    }
  };
  useEffect(() => {
    fetch(`${API_URL}api/payment-plans`)
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [API_URL]);
  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);

        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);
  console.log("userinfo", userInfo?.sub);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}api/usage/${userInfo?.sub}`
        );
        console.log("usage", response.data);

        const data = response.data;

        const total = Math.round(
          data.previousPlanRemainingMinutes + data.allowedMinutes
        );
        const used = Math.round(data.usedMinutes);

        setTotalMinutes(total);
        setUsedMinutes(used);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userInfo?.sub) {
      fetchData();
    }
  }, [API_URL, userInfo?.sub]);
  console.log("total minutes", totalMinutes);

  console.log("used minutes", usedMinutes);
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo?.sub) {
        console.error(
          "User ID (sub) is undefined. Skipping billing history fetch."
        );
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}api/billing-history/${userInfo?.sub}`
        );
        console.log("Billing history response:", response.data);

        const formattedData = response.data.map((item: Invoice) => {
          const rawDate = new Date(item.current_period_start);
          const formattedDate = rawDate
            .toLocaleString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(" at", "");

          const invoiceMonthYear = rawDate.toLocaleString("en-GB", {
            month: "long",
            year: "numeric",
          });

          return {
            ...item,
            id: item.id,
            amount: item.amount,
            invoice: invoiceMonthYear,
            plan: item.paymentPlan?.title ?? "N/A",
            billingDate: formattedDate,
            invoice_url: item.invoice_url,
            invoice_pdf_url: item.invoice_pdf_url,
          };
        });
        const activePlans = formattedData.filter((plan: any) => {
          const endDate = new Date(plan.current_period_end);
          return endDate.getTime() > Date.now();
        });

        setSubscribedPlan(activePlans);
        const latestSelectedPlan = [...formattedData].sort(
          (a, b) =>
            new Date(b.current_period_start).getTime() -
            new Date(a.current_period_start).getTime()
        )[0];

        // Step 2: Set selected plan (full object) and type from that invoice
        if (latestSelectedPlan) {
          setCurrentPlan(latestSelectedPlan); // full object
          setSelectedPlan(latestSelectedPlan.type);
          setActivePlan(latestSelectedPlan.plan);
          setplanType(latestSelectedPlan.type);
          // setTotalMinutes(currentPlan?.paymentPlan?.features?.minutes || 0)
        }
        setInvoices(formattedData);
      } catch (error) {
        console.error("Error fetching billing history:", error);
      }
    };

    fetchData();
  }, [userInfo?.sub, API_URL]);
  console.log("subscribed plan", subscribedPlan);
  useEffect(() => {
    const originalPrice = Number(currentPlan?.PaymentPlanPricing?.price);
    const discount = currentPlan?.PaymentPlanPricing?.discount;
    const discountType = currentPlan?.PaymentPlanPricing?.discount_type;
    setPrice(originalPrice); // Set default price to original price
    if (discount && !isNaN(originalPrice)) {
      if (discountType === "percentage") {
        setPrice(originalPrice - (originalPrice * discount) / 100);
      } else if (discountType === "fixed") {
        setPrice(originalPrice - discount);
      }
    }
    if (currentPlan?.current_period_end) {
      const now = new Date();
      const end = new Date(currentPlan.current_period_end);
      const msLeft = end.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    }
  }, [currentPlan]);
  console.log("current plan", currentPlan);
  console.log("invoices", Invoices);
  const sortedPlans = [...plans]
    .filter((plan) => plan.title !== "Free Trial") // Exclude Free Trial
    .sort((a, b) => {
      // Push "Enterprise" plan to the end
      if (a.title === "Enterprise") return 1;
      if (b.title === "Enterprise") return -1;

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
    <div className="flex flex-col items-start w-full gap-y-[60px]">
      {currentPlan && activePlan && (
        <div className="w-full flex flex-col items-start gap-y-3.5">
          <div className="flex flex-col gap-y-1">
            <h3 className="text-2xl font-semibold text-left text-primary">
              Usage
            </h3>
            <p className="text-sm font-medium text-left text-default-gray">
              Check usage and current plan
            </p>
          </div>
          <div className="w-full">
            <Card className="w-full md:w-[645px] p-5">
              <CardContent className="flex flex-col gap-y-6 px-0">
                <div className="flex justify-between items-center">
                  <div className="flex gap-x-4 items-center justify-center">
                    <h3 className=" text-[20px] md:text-2xl font-semibold text-left text-primary">
                      {currentPlan?.paymentPlan?.title}
                    </h3>
                    <Button
                      type="button"
                      className="px-2 py-0 h-[20px] md:h-auto md:px-4 md:py-1 font-medium text-default-gray text-[10px] md:text-[16px] rounded-[60px]"
                      variant="outline"
                    >
                      {currentPlan?.type === "month"
                        ? Price > 0.0
                          ? "Monthly"
                          : "14 Days"
                        : "Yearly"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center">
                    {currentPlan?.paymentPlan?.title === "Free Plan" ||
                    !currentPlan?.stripe_customer_id ? (
                      <span className="text-[18px] md:text-2xl font-semibold text-primary">
                        {daysLeft} Days Left
                      </span>
                    ) : (
                      <>
                        <span className="text-[20px] md:text-[38px] font-semibold text-primary">
                          ${Price.toFixed(2)}
                        </span>
                        <span className="text-[18px] md:text-2xl font-semibold text-default-gray">
                          {currentPlan?.PaymentPlanPricing?.type === "month"
                            ? "/Per Month"
                            : "/Per Year"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[14px] md:text-[16px] font-medium text-left pb-1.5 text-primary">
                    <span>{usedMinutes} minutes out of </span>
                    {totalMinutes} minutes{" "}
                    {currentPlan?.PaymentPlanPricing?.type === "month"
                      ? ""
                      : "this month"}
                  </p>
                  <Progress
                    value={progressPercentage}
                    title={`${usedMinutes}/${totalMinutes} minutes`}
                    className="h-3 text-default-purple bg-gray-200"
                  />
                </div>
                <hr />
                <a href="#payment-plans">
                  <Button
                    type="button"
                    className="px-4 py-2 cursor-pointer text-primary font-normal bg-gray-200 text-[16px] md:text-[20px] rounded-[10px] float-end"
                    variant="outline"
                  >
                    Upgrade Plan
                    <ArrowRight className="ml-2.5 h-6 w-6" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
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
              Check usage and current plan
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
            if (plan.title === "Free Trial") return null;
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
              plan.pricings.find((p) => p.type === "month") || plan.pricings[0];
            const yearlyPricing = plan.pricings.find((p) => p.type === "year");

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
              <PaymentPlanCard
                key={plan.id}
                planType={planType}
                title={plan.title}
                Monthlyprice={finalMonthlyPrice}
                Yearlyprice={finalYearlyPrice}
                features={featureList}
                isFeatured={plan.is_popular}
                isActive={activePlan === plan.title}
                onSelect={() => {
                  handleCheckout(plan.id, selectedPlan);
                }}
                {...(!isLast && { selectedPlan })}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col w-full gap-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className=" flex flex-col gap-y-1">
            <h3 className="text-2xl  font-semibold text-left text-primary">
              Billing History
            </h3>
            <p className="text-sm font-medium text-left text-default-gray">
              Download previous prices
            </p>
          </div>
          <div className="grid grid-cols-2 mt-4 md:mt-0  md:grid-cols-[auto_120px_220px] gap-y-[10px] justify-items-center gap-x-2 md:gap-x-6">
            <SearchInput />
            <Filter />
            <Button
              type="button"
              variant={"outline"}
              className="text-[12px] md:text-[20px] font-normal text-default-gray rounded-[8px] px-5 py-3.5 h-[40px] md:h-[50px] w-full md:w-[196px]"
              onClick={() => downloadAllInvoices(Invoices)}
            >
              <DownloadCloud className="w-6 h-6" /> Download All
            </Button>
          </div>
        </div>
        <div className="border rounded-[12px] mb-[50px]">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap w-full">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer pl-4 py-2 text-left whitespace-nowrap  text-primary text-lg font-medium"
                    >
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={index}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-[18.5px] text-default-gray py-[14px] text-left text-lg font-medium"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-4"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center p-5 border-t border-[#E0E1E4]">
            <span className="text-sm font-medium text-primary">
              Page {pageIndex + 1}
            </span>
            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
                className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
              >
                &lt;
              </button>
              <div className="flex space-x-2">
                {Array.from({
                  length: Math.ceil(Invoices.length / pageSize),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPageIndex(index)}
                    className={`px-3 py-1.5 font-semibold text-sm rounded-[8px] transition-all duration-200 
                                                    ${
                                                      index === pageIndex
                                                        ? "border border-[#46a79d] text-[#46a79d] font-bold"
                                                        : "text-black"
                                                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setPageIndex((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(Invoices.length / pageSize) - 1
                    )
                  )
                }
                disabled={
                  pageIndex === Math.ceil(Invoices.length / pageSize) - 1
                }
                className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanAndBilling;
