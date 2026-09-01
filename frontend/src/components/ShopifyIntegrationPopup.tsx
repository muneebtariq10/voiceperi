import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  userInfo: { id: string } | null;
};

export const ShopifyIntegrationPopup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  userInfo,
}) => {
  const [storeUrl, setStoreUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const [businessInfoId, setBusinessInfoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isOpen && userInfo?.id) {
      fetchBusinessInfo();
    }
  }, [isOpen, userInfo?.id]);

  const fetchBusinessInfo = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `${API_URL}api/businessinfos/${userInfo?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch business info`);
      }

      const data = await response.json();
      setBusinessInfoId(data.id);
      setStoreUrl(data.shopifyStoreUrl || "");
      setClientId(data.shopifyClientId || "");
      setClientSecret(data.shopifyClientSecret || "");
      setAccessToken(data.shopifyAccessToken || "");
      setIsFetching(false);
    } catch (error) {
      console.error("Failed to fetch business info:", error);
      setIsFetching(false);
    }
  };

  async function handleSave() {
    try {
      if (!businessInfoId) {
        toast.error("Business info not found. Please setup your profile first.");
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        `${API_URL}api/businessinfos/${businessInfoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shopifyStoreUrl: storeUrl,
            shopifyClientId: clientId,
            shopifyClientSecret: clientSecret,
            shopifyAccessToken: accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setIsLoading(false);
      toast.success("Shopify credentials saved!");
      onClose();
    } catch (error) {
      console.error("Failed to save Shopify credentials:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="p-6 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)] border-[var(--border-default)]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-[var(--text-primary)]">
            <span>Shopify Integration</span>
            <DialogClose className="cursor-pointer" />
          </DialogTitle>
        </DialogHeader>
        <hr className="w-full bg-[var(--border-default)]" />

        {isFetching ? (
          <div className="flex justify-center items-center h-[200px]">
            <span className="text-[var(--text-secondary)]">Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4 py-2">
            <div className="flex flex-col items-start w-full gap-y-2">
              <label htmlFor="storeUrl" className="text-[16px] md:text-[18px] font-[500] text-[var(--text-primary)]">
                Shopify Store URL
              </label>
              <Input
                id="storeUrl"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="e.g. mystore.myshopify.com"
                className="bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex flex-col items-start w-full gap-y-2">
              <label htmlFor="clientId" className="text-[16px] md:text-[18px] font-[500] text-[var(--text-primary)]">
                Client ID
              </label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Shopify App Client ID"
                className="bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex flex-col items-start w-full gap-y-2">
              <label htmlFor="clientSecret" className="text-[16px] md:text-[18px] font-[500] text-[var(--text-primary)]">
                Client Secret
              </label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Shopify App Client Secret"
                className="bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex flex-col items-start w-full gap-y-2">
              <label htmlFor="accessToken" className="text-[16px] md:text-[18px] font-[500] text-[var(--text-primary)]">
                Access Token (Optional)
              </label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Programmatic Access Token"
                className="bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                If omitted, the system will attempt to generate an access token using your Client ID and Client Secret.
              </span>
            </div>

            <div className="w-full flex justify-end mt-[20px]">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-[120px] rounded-[8px] font-semibold"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
