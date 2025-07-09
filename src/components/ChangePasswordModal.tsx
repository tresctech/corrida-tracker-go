import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onPasswordChanged: () => void;
}

export const ChangePasswordModal = ({ isOpen, onPasswordChanged }: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("A senha deve ter no mínimo 8 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getPasswordStrengthIndicator = () => {
    if (!newPassword) return null;
    
    const validation = validatePassword(newPassword);
    const strength = 5 - validation.errors.length;
    
    let strengthText = "";
    let strengthColor = "";
    
    if (strength <= 1) {
      strengthText = "Muito fraca";
      strengthColor = "text-red-500";
    } else if (strength <= 2) {
      strengthText = "Fraca";
      strengthColor = "text-orange-500";
    } else if (strength <= 3) {
      strengthText = "Média";
      strengthColor = "text-yellow-500";
    } else if (strength <= 4) {
      strengthText = "Forte";
      strengthColor = "text-blue-500";
    } else {
      strengthText = "Muito forte";
      strengthColor = "text-green-500";
    }

    return (
      <div className="mt-1 text-xs">
        <span className={strengthColor}>Força da senha: {strengthText}</span>
        {validation.errors.length > 0 && (
          <div className="mt-1 space-y-1">
            {validation.errors.map((error, index) => (
              <div key={index} className="flex items-center text-red-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      const passwordValidation = validatePassword(newPassword);
      
      if (!passwordValidation.isValid) {
        toast({
          title: "Senha inválida",
          description: passwordValidation.errors.join(". "),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "As senhas digitadas devem ser idênticas.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Remover flag de força de troca de senha
      const { error: updateMetadataError } = await supabase.auth.updateUser({
        data: {
          force_password_change: false
        }
      });

      if (updateMetadataError) {
        console.error("Erro ao atualizar metadata:", updateMetadataError);
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada e agora você pode usar o sistema normalmente.",
      });

      onPasswordChanged();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-orange-600">
            ⚠️ Alteração de Senha Obrigatória
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              Por motivos de segurança, você deve alterar sua senha temporária antes de continuar usando o sistema.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Digite sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {getPasswordStrengthIndicator()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirme sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>As senhas não coincidem</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full running-gradient text-white"
              disabled={loading}
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};