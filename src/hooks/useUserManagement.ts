import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar papéis de todos os usuários
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combinar dados de perfis com papéis
      const usersWithRoles: UserProfile[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: userRoles
          .filter(role => role.user_id === profile.id)
          .map(role => role.role)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
        .select();

      if (error) throw error;

      toast({
        title: 'Papel atribuído',
        description: `Papel de ${role} atribuído com sucesso.`,
      });

      await loadUsers(); // Recarregar lista
    } catch (error: any) {
      console.error('Error assigning role:', error);
      
      if (error.code === '23505') { // Unique violation
        toast({
          title: 'Papel já existe',
          description: 'Este usuário já possui este papel.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao atribuir papel',
          description: 'Não foi possível atribuir o papel.',
          variant: 'destructive',
        });
      }
    }
  };

  const removeRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: 'Papel removido',
        description: `Papel de ${role} removido com sucesso.`,
      });

      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Erro ao remover papel',
        description: 'Não foi possível remover o papel.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    assignRole,
    removeRole,
    refreshUsers: loadUsers,
  };
};