
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, checkPasswordResetRateLimit, recordPasswordResetAttempt, sanitizeInput, logSecurityEvent } from "@/utils/security";
import { supabase } from "@/integrations/supabase/client";

interface SecurePasswordResetProps {
  onBackToLogin: () => void;
}

export const SecurePasswordReset = ({ onBackToLogin }: SecurePasswordResetProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      // Validate email
      if (!validateEmail(sanitizedEmail)) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check rate limiting
      const rateLimitCheck = await checkPasswordResetRateLimit(sanitizedEmail);
      if (!rateLimitCheck.allowed) {
        toast({
          title: "Muitas tentativas",
          description: `Aguarde ${rateLimitCheck.remainingTime} minutos antes de tentar novamente.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate secure temporary password
      const tempPassword = generateSecurePassword();
      
      // Call the secure reset password function
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { 
          email: sanitizedEmail, 
          newPassword: tempPassword 
        }
      });

      // Record attempt regardless of success/failure
      await recordPasswordResetAttempt(sanitizedEmail);
      
      if (error) {
        console.error('Password reset error:', error);
        await logSecurityEvent('password_reset_failed', { email: sanitizedEmail, error: error.message });
        
        toast({
          title: "Erro no reset de senha",
          description: "Não foi possível resetar a senha. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        await logSecurityEvent('password_reset_requested', { email: sanitizedEmail });
        
        toast({
          title: "Senha resetada com sucesso!",
          description: "Verifique seu email para a nova senha temporária.",
        });
        
        setShowPasswordForm(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      await logSecurityEvent('password_reset_error', { email: sanitizeInput(email) });
      
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro interno. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSecurePassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly (total length: 12)
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  if (showPasswordForm) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
            Email Enviado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Uma nova senha temporária foi enviada para <strong>{email}</strong>. 
              Você será obrigado a alterá-la no primeiro login por questões de segurança.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={onBackToLogin} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-600">
          Reset de Senha
        </CardTitle>
        <p className="text-muted-foreground">
          Digite seu email para receber uma nova senha temporária
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por segurança, você só pode solicitar 3 resets por hora por email.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Nova Senha"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
