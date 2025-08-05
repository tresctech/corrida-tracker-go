
import { supabase } from "@/integrations/supabase/client";

// Rate limiting for password resets
export const checkPasswordResetRateLimit = async (email: string): Promise<{ allowed: boolean; remainingTime?: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke('security-helpers', {
      body: { action: 'check_rate_limit', email }
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Allow on error to not block legitimate users
    }

    return data || { allowed: true };
  } catch (error) {
    console.error('Error in rate limiting:', error);
    return { allowed: true }; // Allow on error
  }
};

export const recordPasswordResetAttempt = async (email: string) => {
  try {
    await supabase.functions.invoke('security-helpers', {
      body: { action: 'record_attempt', email }
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
export const logSecurityEvent = async (eventAction: string, details?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.functions.invoke('security-helpers', {
      body: {
        action: 'log_security_event',
        user_id: user?.id || null,
        event_action: eventAction,
        details: details || {},
        ip_address: null, // Could be enhanced to get real IP
        user_agent: navigator.userAgent
      }
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
