import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import runningHeroBg from "@/assets/running-hero-bg.jpg";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const generateComplexPassword = (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Garantir pelo menos um caractere de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar com caracteres aleatórios até 12 caracteres
    const allCharacters = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gerar nova senha complexa
      const newPassword = generateComplexPassword();
      
      // Chamar edge function para resetar senha e enviar email
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email, newPassword }
      });

      if (error) throw error;

      toast({
        title: "Senha resetada!",
        description: "Uma nova senha foi enviada para seu email. Você será obrigado a alterá-la no primeiro acesso.",
      });

      setIsForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Não foi possível resetar a senha. Verifique se o email está correto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao PulseRun.",
        });
      } else {
        // Validações para cadastro
        const passwordValidation = validatePassword(password);
        
        if (!passwordValidation.isValid) {
          toast({
            title: "Senha inválida",
            description: passwordValidation.errors.join(". "),
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "Senhas não coincidem",
            description: "As senhas digitadas devem ser idênticas.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthIndicator = () => {
    if (!password || isLogin) return null;
    
    const validation = validatePassword(password);
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${runningHeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            PulseRun
          </CardTitle>
          <p className="text-muted-foreground">
            {isForgotPassword 
              ? "Resetar sua senha" 
              : isLogin 
              ? "Entre na sua conta" 
              : "Crie sua conta"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForgotPassword ? (
            // Formulário de esqueci minha senha
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full running-gradient text-white"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Resetar Senha"}
              </Button>
            </form>
          ) : (
            // Formulário de login/cadastro
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="Seu nome completo"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {getPasswordStrengthIndicator()}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      placeholder="Confirme sua senha"
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
                  {!isLogin && confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center text-red-500 text-xs mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>As senhas não coincidem</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full running-gradient text-white"
                disabled={loading}
              >
                {loading
                  ? "Carregando..."
                  : isLogin
                  ? "Entrar"
                  : "Criar conta"}
              </Button>
            </form>
          )}

          <div className="text-center space-y-2">
            {isForgotPassword ? (
              <Button
                variant="link"
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmail("");
                }}
              >
                Voltar ao login
              </Button>
            ) : (
              <>
                <Button
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setFullName("");
                  }}
                >
                  {isLogin
                    ? "Não tem conta? Cadastre-se"
                    : "Já tem conta? Entre aqui"}
                </Button>
                
                {isLogin && (
                  <div>
                    <Button
                      variant="link"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setPassword("");
                        setConfirmPassword("");
                        setFullName("");
                      }}
                      className="text-sm"
                    >
                      Esqueci minha senha
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
