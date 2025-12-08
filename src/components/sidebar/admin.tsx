"use client"

import SidebarNav from "@/components/sidebar/nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { menus } from "@/config/menu/admin"
import { Bot, ChevronDown, Cog } from "lucide-react"
import { ComponentProps } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Button } from "../ui/button"
import Link from "next/link"

export default function AdminSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="sticky top-(--header-height) h-[calc(100svh-var(--header-height))]!" collapsible="icon" {...props}>
      <SidebarContent className="mt-2">
        {menus.map((menu, index) => (
          <SidebarGroup key={index}>
            {menus.length === 1 && (
              <SidebarNav baseUrl={menu.baseUrl} items={menu.items} />
            )}
            {menus.length > 1 && (
              <>
                <SidebarGroupLabel className="h-4">
                  {menu.title}
                </SidebarGroupLabel>
                <SidebarNav baseUrl={menu.baseUrl} items={menu.items} />
              </>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="text-sm gap-2 has-[>svg]:px-2">
                  <Cog />
                  Settings
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="pl-4 group-data-[collapsible=icon]:pl-0 pb-8 list-none">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                  <Link href="/admin/settings/chatbots">
                    <Bot />
                    <span>Chatbots</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="AI Models" asChild>
                  <Link href="/admin/settings/ai-models">
                    <Bot />
                    <span>AI Models</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </CollapsibleContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Toggle Sidebar" asChild>
                  <SidebarTrigger mobileIcon="X" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </Collapsible>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
