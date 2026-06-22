import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: {
    firstname: string;
    email: string;
    lastname: string;
    status: number;
    verified: number;
    id: string;
  };
  onSubmit: (updatedData: any) => void;
};

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  selectedRow,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    verified: "0",
    status: "0",
    email: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        firstname: selectedRow.firstname || "",
        lastname: selectedRow.lastname || "",
        verified:
          selectedRow.verified !== undefined
            ? String(selectedRow.verified)
            : "0",
        status:
          selectedRow.status !== undefined ? String(selectedRow.status) : "0",
        email: selectedRow.email || "",
      });
    }
  }, [selectedRow]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      verified: Number(formData.verified),
      status: Number(formData.status),
    };

    try {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}api/users/${selectedRow.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User updated successfully", response.data);

      onSubmit(response.data); // send updated user back
      onClose();
      toast.success("User info updated");
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-primary">
            Edit User Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-y-4 py-6">
          <label className="text-sm font-medium text-primary">First Name</label>
          <input
            className="border px-3 py-2 rounded w-full"
            value={formData.firstname}
            onChange={(e) => handleChange("firstname", e.target.value)}
          />

          <label className="text-sm font-medium text-primary">Last Name</label>
          <input
            className="border px-3 py-2 rounded w-full"
            value={formData.lastname}
            onChange={(e) => handleChange("lastname", e.target.value)}
          />

          <label className="text-sm font-medium text-primary">Email</label>
          <input
            className="border px-3 py-2 rounded w-full"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <label className="text-sm font-medium text-primary">Verified</label>
          <Select
            value={formData.verified}
            onValueChange={(value) => handleChange("verified", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select verification status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Verified</SelectItem>
              <SelectItem value="0">Not Verified</SelectItem>
            </SelectContent>
          </Select>

          <label className="text-sm font-medium text-primary">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#5222FF] hover:bg-[#225dff]"
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
