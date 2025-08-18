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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
      <SidebarContent className="bg-card/95 backdrop-blur-sm border-r border-border/50">
        {/* Logo Section */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-primary-foreground">🏃‍♂️</span>
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
        <div className="p-4 border-b border-border/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton 
                  onClick={onAddRace}
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  {open && <span className="ml-2 font-medium">Nova Corrida</span>}
                </SidebarMenuButton>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right" className="font-medium">
                  Nova Corrida
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
            {open && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          onClick={() => onViewChange(item.view)}
                          className={`w-full justify-start transition-all duration-200 hover:translate-x-1 ${
                            isActive(item.view) 
                              ? "bg-primary/15 text-primary border-l-4 border-primary shadow-sm dark:bg-primary/20" 
                              : "hover:bg-accent/80 text-foreground dark:hover:bg-accent/50"
                          }`}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {open && (
                            <div className="ml-3 flex flex-col items-start min-w-0">
                              <span className="text-sm font-medium truncate">{item.title}</span>
                              <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent side="right" className="font-medium">
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              {open && "Administração"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <TooltipProvider>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            onClick={() => onViewChange(item.view)}
                            className={`w-full justify-start transition-all duration-200 hover:translate-x-1 ${
                              isActive(item.view) 
                                ? "bg-primary/15 text-primary border-l-4 border-primary shadow-sm dark:bg-primary/20" 
                                : "hover:bg-accent/80 text-foreground dark:hover:bg-accent/50"
                            }`}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {open && (
                              <div className="ml-3 flex flex-col items-start min-w-0">
                                <span className="text-sm font-medium truncate">{item.title}</span>
                                <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                              </div>
                            )}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && (
                          <TooltipContent side="right" className="font-medium">
                            <div>
                              <div className="font-semibold">{item.title}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </TooltipProvider>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}