import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscriptionInfo({ subscribed: false, subscription_tier: null, subscription_end: null });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar status da assinatura",
          variant: "destructive",
        });
      } else {
        console.log('Subscription check result:', data);
        setSubscriptionInfo({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
        });
      }
    } catch (error) {
      console.error('Exception checking subscription:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (!user || !session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para assinar",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar sessão de pagamento",
          variant: "destructive",
        });
      } else if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Exception creating checkout:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar checkout",
        variant: "destructive",
      });
    }
  };

  const manageSubscription = async () => {
    if (!user || !session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerenciar a assinatura",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating customer portal session...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating customer portal:', error);
        toast({
          title: "Erro",
          description: "Erro ao acessar portal do cliente",
          variant: "destructive",
        });
      } else if (data?.url) {
        console.log('Redirecting to customer portal:', data.url);
        // Open Stripe customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Exception creating customer portal:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao acessar portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionInfo,
    loading,
    checkSubscription,
    createCheckout,
    manageSubscription,
  };
};