import { NavLink, useLocation } from "react-router-dom";
import { IconProps, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
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
                  className={`flex items-center gap-3 font-semibold text-[16px] px-4 py-3 rounded-[10px] transition-all duration-200 ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" : "bg-transparent text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                >
                  {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
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
