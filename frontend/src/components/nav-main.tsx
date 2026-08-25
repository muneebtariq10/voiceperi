import { NavLink, useLocation } from "react-router-dom";
import { IconProps, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  }[];
}) {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">

        <SidebarMenu>
          <nav className="flex flex-col gap-2">
            {items.map((item) => {
              const isActive = location.pathname === item.url;

              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-3 font-semibold text-[17px] px-4 py-3 rounded-[10px] transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-md" : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  {item.icon && <item.icon className="w-6 h-6" />}
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
