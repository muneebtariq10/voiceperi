import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface Feature {
  key: string;
  value: boolean | number;
}

interface Pricing {
  type: string;
  price: number;
  discount_type: string;
  discount: number;
}

interface FormData {
  title: string;
  is_popular: boolean;
  features: Feature[];
  pricing: Pricing[];
}

const CreatePlan: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    is_popular: false,
    features: [
      { key: "minutes", value: 0 },
      { key: "price_per_minute", value: 0 },
      { key: "zapier_integration", value: false },
      { key: "smart_spam_detection", value: false },
      { key: "crm_integration", value: false },
      { key: "custom_agent_training", value: false },
      { key: "advance_call_transfer", value: false },
      { key: "appointment_links", value: false },
      { key: "advance_appointment_booking", value: false },
    ],
    pricing: [
      { type: "month", price: 0, discount_type: "value", discount: 0 },
      { type: "year", price: 0, discount_type: "percentage", discount: 0 },
    ],
  });

  const [newFeatureName, setNewFeatureName] = useState<string>("");
  const [newFeatureValue, setNewFeatureValue] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;

      try {
        const res = await fetch(`${API_URL}api/payment-plans/${id}`);
        if (!res.ok) throw new Error("Failed to fetch plan");
        const data = await res.json();

        const featuresArray: Feature[] = Object.entries(data.features)
          .filter(
            ([_, value]) =>
              typeof value === "boolean" || typeof value === "number"
          )
          .map(([key, value]) => ({ key, value: value as boolean | number }));

        setFormData((prev) => ({
          ...prev,
          ...data,
          features: featuresArray,
          pricing: data.pricings,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load plan for editing");
      }
    };

    fetchPlan();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_URL}api/payment-plans/${id}`
        : `${API_URL}api/payment-plans`;

      const sanitizedFormData = {
        ...formData,
        features: formData.features.reduce(
          (acc: Record<string, boolean | number>, { key, value }) => {
            acc[key] = value;
            return acc;
          },
          {}
        ),
        pricing: formData.pricing.map((p) => ({
          ...p,
          price: parseFloat(p.price.toString()),
          discount: parseFloat(p.discount.toString()),
        })),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedFormData),
      });

      if (!response.ok) throw new Error("Failed to submit plan");

      toast.success(
        id ? "Plan updated successfully!" : "Plan created successfully!"
      );
      navigate(`/dashboard/plans`);
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast.error("Error submitting plan");
    }
  };

  const handleFeatureChange = (index: number, newValue: boolean | number) => {
    const updated = [...formData.features];
    updated[index].value = newValue;
    setFormData({ ...formData, features: updated });
  };

  const handleAddFeature = () => {
    const key = newFeatureName.trim().replace(/\s+/g, "_").toLowerCase();
    if (!key || formData.features.some((f) => f.key === key)) {
      toast.error("Feature already exists or is empty");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { key, value: newFeatureValue }],
    }));
    setNewFeatureName("");
    setNewFeatureValue(false);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...formData.features];
    updated.splice(index, 1);
    setFormData({ ...formData, features: updated });
  };

  const moveFeature = (fromIndex: number, toIndex: number) => {
    const updated = [...formData.features];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setFormData({ ...formData, features: updated });
  };

  const handlePricingChange = (
    index: number,
    field: keyof Pricing,
    value: any
  ) => {
    const updatedPricing = [...formData.pricing];
    updatedPricing[index] = { ...updatedPricing[index], [field]: value };
    setFormData((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="w-full flex justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl flex flex-col gap-8"
      >
        <h2 className="text-2xl font-bold text-primary">Create a New Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-sm text-default-gray mb-1">
              Plan Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              placeholder="Standard"
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="is_popular"
              checked={formData.is_popular}
              onChange={handleChange}
            />
            <label className="text-sm font-medium text-default-gray">
              Mark as Featured
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.features.map(({ key, value }, index) => (
              <div key={key} className="flex items-center gap-2">
                <label className="capitalize text-sm w-40">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type={typeof value === "boolean" ? "checkbox" : "number"}
                  min="0"
                  step="any"
                  checked={typeof value === "boolean" ? value : undefined}
                  value={typeof value === "number" ? value : ""}
                  onChange={(e) =>
                    handleFeatureChange(
                      index,
                      typeof value === "boolean"
                        ? e.target.checked
                        : parseFloat(e.target.value)
                    )
                  }
                  className="border px-2 py-1 rounded"
                />
                {!["minutes", "price_per_minute"].includes(key) && (
                  <>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveFeature(index, index - 1)}
                        className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === formData.features.length - 1}
                        onClick={() => moveFeature(index, index + 1)}
                        className="text-xs px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 text-xs hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <input
              type="text"
              placeholder="Add new feature"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              className="border p-2 rounded w-full sm:w-1/2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newFeatureValue}
                onChange={(e) => setNewFeatureValue(e.target.checked)}
              />
              Enabled
            </label>
            <Button
              type="button"
              onClick={handleAddFeature}
              className="bg-default-purple text-white px-4 py-2 rounded-[20px] hover:bg-[#46a79d] cursor-pointer hover:opacity-85 transition"
            >
              Add Feature
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.pricing.map((price, index) => (
              <div
                key={index}
                className="border p-4 rounded shadow-sm flex flex-col gap-3"
              >
                <h4 className="text-md font-semibold capitalize text-primary">
                  {price.type} Billing
                </h4>
                <label className="text-sm text-default-gray">Price</label>
                <input
                  type="number"
                  value={price.price}
                  min="0"
                  step="any"
                  onChange={(e) =>
                    handlePricingChange(
                      index,
                      "price",
                      parseFloat(e.target.value)
                    )
                  }
                  className="border p-2 rounded"
                  placeholder="Enter price"
                />
                <label className="text-sm text-default-gray">
                  Discount Type
                </label>
                <select
                  value={price.discount_type}
                  onChange={(e) =>
                    handlePricingChange(index, "discount_type", e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="value">Flat Discount</option>
                  <option value="percentage">Percentage Discount</option>
                </select>
                <label className="text-sm text-default-gray">Discount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price.discount}
                  onChange={(e) =>
                    handlePricingChange(
                      index,
                      "discount",
                      parseFloat(e.target.value)
                    )
                  }
                  className="border p-2 rounded"
                  placeholder="Enter discount"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-6 bg-default-purple text-white px-6 py-3 rounded-[20px] hover:bg-[#46a79d] hover:opacity-85 cursor-pointer transition w-[200px]"
          >
            {id ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlan;
