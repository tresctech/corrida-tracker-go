import { Home, List, Dumbbell, Crown, Settings, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal" | "training"

interface MobileNavigationProps {
  currentView: View
  onViewChange: (view: View) => void
  onAddRace: () => void
}

export function MobileNavigation({ currentView, onViewChange, onAddRace }: MobileNavigationProps) {
  const { isAdmin } = useAuth()

  const navItems = [
    { 
      title: "Início", 
      view: "dashboard" as View, 
      icon: Home,
      emoji: "🏠"
    },
    { 
      title: "Corridas", 
      view: "list" as View, 
      icon: List,
      emoji: "🏃‍♂️"
    },
    { 
      title: "Treinos", 
      view: "training" as View, 
      icon: Dumbbell,
      emoji: "💪"
    },
    { 
      title: "Personal", 
      view: "personal" as View, 
      icon: Crown,
      emoji: "👑"
    },
  ]

  if (isAdmin) {
    navItems.push({
      title: "Admin",
      view: "admin" as View,
      icon: Settings,
      emoji: "⚙️"
    })
  }

  const isActive = (view: View) => currentView === view

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border shadow-2xl">
      <div className="relative">
        {/* Floating Action Button */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={onAddRace}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 border-4 border-background hover:from-primary/90 hover:to-secondary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center justify-around px-4 py-2 pb-safe">
          {navItems.map((item, index) => {
            const isCenter = index === Math.floor(navItems.length / 2)
            
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-200",
                  isCenter && "opacity-0 pointer-events-none", // Hide center item for FAB space
                  isActive(item.view) && "scale-110"
                )}
              >
                <div className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-200",
                  isActive(item.view) 
                    ? "bg-primary/20 text-primary shadow-sm dark:bg-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70 dark:hover:bg-accent/40"
                )}>
                  <item.icon className="h-5 w-5" />
                  {isActive(item.view) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-sm" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1 transition-colors duration-200",
                  isActive(item.view) 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}