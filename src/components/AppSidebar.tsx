import { useState } from "react"
import { BarChart3, Dumbbell, Crown, Settings, Plus, Home } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal" | "training"

interface AppSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  onAddRace: () => void
}

export function AppSidebar({ currentView, onViewChange, onAddRace }: AppSidebarProps) {
  const { open } = useSidebar()
  const { isAdmin } = useAuth()

  const mainItems = [
    { 
      title: "Dashboard", 
      view: "dashboard" as View, 
      icon: Home,
      description: "Visão geral"
    },
    { 
      title: "Minhas Corridas", 
      view: "list" as View, 
      icon: BarChart3,
      description: "Ver todas as corridas"
    },
    { 
      title: "Treinos", 
      view: "training" as View, 
      icon: Dumbbell,
      description: "Planos de treino"
    },
    { 
      title: "Personal Trainer", 
      view: "personal" as View, 
      icon: Crown,
      description: "Treinamento personalizado"
    },
  ]

  const adminItems = isAdmin ? [
    { 
      title: "Administração", 
      view: "admin" as View, 
      icon: Settings,
      description: "Gerenciar usuários"
    },
  ] : []

  const isActive = (view: View) => currentView === view

  return (
    <Sidebar className={!open ? "w-64" : "w-14"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
            {open && (
              <div>
                <h2 className="font-bold text-foreground">PulseRun</h2>
                <p className="text-xs text-muted-foreground">Seu companheiro de corrida</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border">
          <SidebarMenuButton 
            onClick={onAddRace}
            className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {open && <span className="ml-2">Nova Corrida</span>}
          </SidebarMenuButton>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            {open && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.view)}
                    className={`w-full justify-start transition-colors ${
                      isActive(item.view) 
                        ? "bg-primary/10 text-primary border-l-2 border-primary" 
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {open && (
                      <div className="ml-2 flex flex-col items-start">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              {open && "Administração"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => onViewChange(item.view)}
                      className={`w-full justify-start transition-colors ${
                        isActive(item.view) 
                          ? "bg-primary/10 text-primary border-l-2 border-primary" 
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && (
                        <div className="ml-2 flex flex-col items-start">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}