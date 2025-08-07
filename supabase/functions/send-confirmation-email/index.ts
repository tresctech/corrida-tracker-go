import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Request body:", body);

    const emailData: EmailData = JSON.parse(body);
    
    const { user, email_data } = emailData;
    const { email, user_metadata } = user;
    const { token_hash, email_action_type, redirect_to, site_url } = email_data;

    console.log("Processing email for:", email, "action:", email_action_type);

    // Construir URL de confirmação
    const confirmationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Definir assunto baseado no tipo de ação
    let subject = "Confirme sua conta - PulseRun";
    let heading = "Bem-vindo ao PulseRun!";
    let actionText = "Confirmar Conta";

    if (email_action_type === "recovery") {
      subject = "Redefinir senha - PulseRun";
      heading = "Redefinir sua senha";
      actionText = "Redefinir Senha";
    }

    const userName = user_metadata?.full_name || email.split('@')[0];

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                padding: 40px; 
                border-radius: 8px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                margin-top: 20px; 
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
            }
            .logo { 
                font-size: 32px; 
                font-weight: bold; 
                background: linear-gradient(135deg, #2563eb, #16a34a); 
                -webkit-background-clip: text; 
                -webkit-text-fill-color: transparent; 
                background-clip: text; 
                margin-bottom: 10px; 
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #2563eb, #16a34a); 
                color: white; 
                padding: 14px 28px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600; 
                margin: 20px 0; 
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee; 
                color: #666; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PulseRun</div>
                <h1>${heading}</h1>
            </div>
            
            <p>Olá ${userName},</p>
            
            ${email_action_type === 'signup' 
                ? `<p>Obrigado por se cadastrar no PulseRun! Para completar seu cadastro e começar a gerenciar suas corridas, você precisa confirmar seu email.</p>`
                : `<p>Recebemos uma solicitação para redefinir a senha da sua conta no PulseRun. Clique no botão abaixo para criar uma nova senha.</p>`
            }
            
            <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">${actionText}</a>
            </div>
            
            <p>Se o botão acima não funcionar, você também pode copiar e colar este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
                ${confirmationUrl}
            </p>
            
            ${email_action_type === 'signup'
                ? `<p>Após a confirmação, você poderá acessar todas as funcionalidades do PulseRun:</p>
                   <ul>
                       <li>📊 Dashboard completo com estatísticas</li>
                       <li>🏃‍♂️ Gestão de corridas e resultados</li>
                       <li>📄 Upload seguro de documentos</li>
                       <li>🎯 Controle de metas e performance</li>
                   </ul>`
                : `<p>Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.</p>`
            }
            
            <div class="footer">
                <p>Este email foi enviado automaticamente pelo PulseRun.<br>
                   Se você não se cadastrou em nossa plataforma, pode ignorar este email.</p>
                <p>© 2025 PulseRun - Plataforma de gestão para runners</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Enviar email usando Resend
    const emailResponse = await resend.emails.send({
      from: "PulseRun <noreply@runtracker.alfasec.com.br>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor",
        details: error.toString()
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