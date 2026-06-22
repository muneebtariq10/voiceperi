import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppUser } from "@/AppContext";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const { user } = AppUser();
  console.log("user global", user);

  return (
    <div className="container mx-auto relative w-full max-w-full">
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <Outlet />
          <Toaster position="top-right" />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
