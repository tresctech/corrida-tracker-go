import { ArrowLeft, LogOut, User, Settings, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type View = "dashboard" | "form" | "list" | "details" | "admin" | "personal" | "training" | "live-tracking"

interface MobileHeaderProps {
  currentView: View
  onBack: () => void
  onSignOut: () => void
}

const getViewTitle = (view: View) => {
  switch (view) {
    case "dashboard": return "PulseRun"
    case "form": return "Nova Corrida"
    case "list": return "Minhas Corridas"
    case "details": return "Detalhes da Corrida"
    case "admin": return "Administração"
    case "personal": return "Personal Trainer"
    case "training": return "Treinos"
    case "live-tracking": return "GPS Live Tracking"
    default: return "PulseRun"
  }
}

const getViewEmoji = (view: View) => {
  switch (view) {
    case "dashboard": return "🏠"
    case "form": return "✨"
    case "list": return "🏃‍♂️"
    case "details": return "📊"
    case "admin": return "⚙️"
    case "personal": return "👑"
    case "training": return "💪"
    case "live-tracking": return "🛰️"
    default: return "🏃‍♂️"
  }
}

export function MobileHeader({ currentView, onBack, onSignOut }: MobileHeaderProps) {
  const { user, isAdmin } = useAuth()
  const showBackButton = currentView !== "dashboard"

  return (
    <header className="sticky top-0 z-40 w-full bg-background/98 backdrop-blur-xl border-b border-border shadow-sm supports-[backdrop-filter]:bg-background/95">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-primary-foreground">🏃‍♂️</span>
            </div>
          )}
          
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground leading-none">
              {getViewEmoji(currentView)} {getViewTitle(currentView)}
            </h1>
            {currentView === "dashboard" && (
              <span className="text-xs text-muted-foreground">
                Bem-vindo de volta!
              </span>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user?.email}</span>
                  {isAdmin && (
                    <span className="text-xs text-primary font-semibold">👑 Administrador</span>
                  )}
                </div>
              </div>
              
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={onSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}