"use client"

import * as React from "react"
import {  type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink, useLocation } from "react-router-dom"

export function NavSecondary({
  items,
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
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
                  className={`flex items-center gap-2 text-white font-medium text-[16px] px-4 py-2 rounded-[10px] transition ${isActive ? "bg-default-purple text-white" : "bg-transparent text-default-gray"
                    }`}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
                <div className={`flex items-center text-white border-1 gap-2 font-medium cursor-pointer text-[16px] px-4 py-2 rounded-[10px] transition `}>
                  <span>
                    <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.03125" width="37" height="37" rx="18.5" fill="#46a79d"/>
                    <path d="M12.7437 12.8939H15.9081L16.9279 15.4437L15.2893 16.5361C15.1928 16.6005 15.1137 16.6877 15.059 16.79C15.0043 16.8923 14.9757 17.0065 14.9757 17.1225C14.9778 17.1887 14.9757 17.1232 14.9757 17.1232V17.138C14.976 17.1695 14.9775 17.201 14.9799 17.2324C14.9837 17.2907 14.9919 17.3682 15.0046 17.465C15.0321 17.6553 15.0849 17.9174 15.1878 18.2261C15.395 18.8463 15.801 19.649 16.5917 20.4398C17.3825 21.2305 18.1852 21.6365 18.8047 21.8437C19.1141 21.9466 19.3755 21.9987 19.5672 22.0269C19.6753 22.0426 19.7843 22.052 19.8935 22.0551L19.9027 22.0558H19.9083C19.9083 22.0558 19.9873 22.0516 19.909 22.0558C20.0399 22.0557 20.1681 22.0192 20.2794 21.9504C20.3907 21.8816 20.4806 21.7831 20.5391 21.6661L21.0113 20.7217L24.1376 21.2432V24.2878C22.6498 24.5027 18.6313 24.7149 15.474 21.5575C12.3166 18.4002 12.5281 14.3809 12.7437 12.8939ZM16.4367 17.465L17.7102 16.6165C17.9792 16.437 18.1784 16.1705 18.2742 15.8616C18.3701 15.5528 18.3568 15.2203 18.2366 14.9201L17.2168 12.3703C17.1122 12.1087 16.9316 11.8845 16.6983 11.7266C16.465 11.5687 16.1898 11.4844 15.9081 11.4844H12.7071C12.0664 11.4844 11.4639 11.9291 11.3589 12.624C11.1192 14.2041 10.7943 18.871 14.4774 22.5541C18.1605 26.2372 22.8274 25.9116 24.4075 25.6726C25.1024 25.5669 25.5471 24.9651 25.5471 24.3244V21.2432C25.5472 20.9096 25.4288 20.5867 25.2132 20.3321C24.9976 20.0775 24.6986 19.9076 24.3695 19.8527L21.2431 19.3319C20.9458 19.2823 20.6404 19.3293 20.3717 19.466C20.1031 19.6028 19.8853 19.822 19.7505 20.0916L19.5066 20.58C19.4204 20.5586 19.3351 20.5339 19.2508 20.506C18.8138 20.3609 18.207 20.062 17.5882 19.4433C16.9695 18.8245 16.6706 18.2177 16.5255 17.78C16.4912 17.6764 16.4618 17.5713 16.4374 17.465H16.4367Z" fill="white"/>
                    </svg>
                    </span><span>(123) 45678901</span>
                </div>
              
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
