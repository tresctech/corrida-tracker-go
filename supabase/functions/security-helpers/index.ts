
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      case 'check_rate_limit':
        result = await checkPasswordResetRateLimit(supabaseClient, params.email);
        break;
      case 'record_attempt':
        result = await recordPasswordResetAttempt(supabaseClient, params.email);
        break;
      case 'log_security_event':
        result = await logSecurityEvent(supabaseClient, params);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function checkPasswordResetRateLimit(supabase: any, email: string) {
  const { data, error } = await supabase
    .from('password_reset_attempts')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking rate limit:', error);
    return { allowed: true };
  }

  if (!data) {
    return { allowed: true };
  }

  const now = new Date();
  const lastAttempt = new Date(data.last_attempt);
  const blockedUntil = data.blocked_until ? new Date(data.blocked_until) : null;

  // Check if still blocked
  if (blockedUntil && now < blockedUntil) {
    const remainingTime = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60));
    return { allowed: false, remainingTime };
  }

  // Reset counter if more than 1 hour has passed
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (lastAttempt < oneHourAgo) {
    await supabase
      .from('password_reset_attempts')
      .upsert({
        email: email.toLowerCase(),
        attempt_count: 1,
        last_attempt: now.toISOString(),
        blocked_until: null
      });
    return { allowed: true };
  }

  // Check if exceeded limit (3 attempts per hour)
  if (data.attempt_count >= 3) {
    const blockUntil = new Date(now.getTime() + 60 * 60 * 1000);
    await supabase
      .from('password_reset_attempts')
      .update({
        blocked_until: blockUntil.toISOString()
      })
      .eq('email', email.toLowerCase());
    
    return { allowed: false, remainingTime: 60 };
  }

  return { allowed: true };
}

async function recordPasswordResetAttempt(supabase: any, email: string) {
  const { data } = await supabase
    .from('password_reset_attempts')
    .select('attempt_count')
    .eq('email', email.toLowerCase())
    .single();

  const newCount = (data?.attempt_count || 0) + 1;
  
  await supabase
    .from('password_reset_attempts')
    .upsert({
      email: email.toLowerCase(),
      attempt_count: newCount,
      last_attempt: new Date().toISOString(),
      blocked_until: null
    });

  return { success: true };
}

async function logSecurityEvent(supabase: any, params: any) {
  await supabase
    .from('security_audit_log')
    .insert({
      user_id: params.user_id,
      action: params.action,
      details: params.details || {},
      ip_address: params.ip_address,
      user_agent: params.user_agent,
      created_at: new Date().toISOString()
    });

  return { success: true };
}
