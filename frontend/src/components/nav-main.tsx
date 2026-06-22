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
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <nav className="flex flex-col gap-2">
            {items.map((item) => {
              const isActive = location.pathname === item.url;

              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-2 text-white font-medium text-[16px] px-4 py-2 rounded-[10px] transition ${isActive ? "bg-[#5e6679] text-secondary" : "bg-transparent text-default-gray"
                    }`}
                >
                  {item.icon && <item.icon />}
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
