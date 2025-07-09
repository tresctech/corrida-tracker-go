import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, newPassword }: ResetPasswordRequest = await req.json();

    // Criar cliente Supabase com chave de serviço para operações administrativas
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar se o usuário existe
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      throw new Error(`Erro ao buscar usuários: ${getUserError.message}`);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Resetar a senha do usuário
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        user_metadata: {
          ...user.user_metadata,
          force_password_change: true // Flag para forçar troca de senha
        }
      }
    );

    if (updateError) {
      throw new Error(`Erro ao resetar senha: ${updateError.message}`);
    }

    // Enviar email com a nova senha usando Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "RunTracker <noreply@resend.dev>",
      to: [email],
      subject: "Nova senha temporária - RunTracker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">
            RunTracker - Nova Senha Temporária
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Olá,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Sua senha foi resetada com sucesso. Use a senha temporária abaixo para fazer login:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <strong style="font-size: 18px; color: #333; font-family: monospace;">
              ${newPassword}
            </strong>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              ⚠️ IMPORTANTE: Você será obrigado a alterar esta senha no primeiro acesso por motivos de segurança.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Por favor, faça login usando esta senha temporária e altere-a imediatamente para uma senha de sua escolha.
          </p>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Se você não solicitou esta alteração, entre em contato conosco imediatamente.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            RunTracker - Sistema de Gerenciamento de Corridas
          </p>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Senha resetada e email enviado com sucesso" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro na função reset-password:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);