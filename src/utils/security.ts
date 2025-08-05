
import { supabase } from "@/integrations/supabase/client";

// Rate limiting for password resets
export const checkPasswordResetRateLimit = async (email: string): Promise<{ allowed: boolean; remainingTime?: number }> => {
  try {
    const { data, error } = await supabase
      .from('password_reset_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Allow on error to not block legitimate users
    }

    if (!data) {
      return { allowed: true };
    }

    const now = new Date();
    const lastAttempt = new Date(data.last_attempt);
    const blockedUntil = data.blocked_until ? new Date(data.blocked_until) : null;

    // Check if still blocked
    if (blockedUntil && now < blockedUntil) {
      const remainingTime = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60)); // minutes
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
      const blockUntil = new Date(now.getTime() + 60 * 60 * 1000); // Block for 1 hour
      await supabase
        .from('password_reset_attempts')
        .update({
          blocked_until: blockUntil.toISOString()
        })
        .eq('email', email.toLowerCase());
      
      return { allowed: false, remainingTime: 60 };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error in rate limiting:', error);
    return { allowed: true }; // Allow on error
  }
};

export const recordPasswordResetAttempt = async (email: string) => {
  try {
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
  } catch (error) {
    console.error('Error recording password reset attempt:', error);
  }
};

// Input validation and sanitization
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("A senha deve ter no mínimo 8 caracteres");
  }
  
  if (password.length > 128) {
    errors.push("A senha deve ter no máximo 128 caracteres");
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

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '') // Remove basic XSS characters
    .trim()
    .substring(0, 1000); // Limit length
};

// Security audit logging
export const logSecurityEvent = async (action: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user?.id || null,
        action,
        details: details || {},
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Fail silently for logging to not break user experience
    console.error('Security logging failed:', error);
  }
};

// File upload security
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Allowed file types for race documents
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ];
  
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Arquivo muito grande. Máximo permitido: 10MB' };
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido' };
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'Extensão de arquivo não permitida' };
  }
  
  // Check for suspicious file names
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { isValid: false, error: 'Nome de arquivo inválido' };
  }
  
  return { isValid: true };
};
