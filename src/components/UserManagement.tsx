
import { useState } from 'react';
import { useUserManagement, UserProfile } from '@/hooks/useUserManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, UserPlus, Shield, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent } from '@/utils/security';

const UserManagement = () => {
  const { users, loading, assignRole, removeRole, deleteUser } = useUserManagement();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleAction, setRoleAction] = useState<'assign' | 'remove'>('assign');
  const [targetRole, setTargetRole] = useState<'admin' | 'user'>('user');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  const handleRoleAction = async () => {
    if (!selectedUser) return;

    try {
      if (roleAction === 'assign') {
        await assignRole(selectedUser.id, targetRole);
        await logSecurityEvent('role_assigned', {
          targetUserId: selectedUser.id,
          targetEmail: selectedUser.email,
          role: targetRole
        });
      } else {
        await removeRole(selectedUser.id, targetRole);
        await logSecurityEvent('role_removed', {
          targetUserId: selectedUser.id,
          targetEmail: selectedUser.email,
          role: targetRole
        });
      }
    } catch (error) {
      await logSecurityEvent('role_action_failed', {
        targetUserId: selectedUser.id,
        action: roleAction,
        role: targetRole,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setSelectedUser(null);
  };

  const handleDeleteUser = async (user: UserProfile) => {
    try {
      await deleteUser(user.id);
      await logSecurityEvent('user_deleted', {
        targetUserId: user.id,
        targetEmail: user.email
      });
    } catch (error) {
      await logSecurityEvent('user_deletion_failed', {
        targetUserId: user.id,
        targetEmail: user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const hasRole = (user: UserProfile, role: string) => {
    return user.roles.includes(role);
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie papéis e permissões dos usuários do sistema
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {users.length} usuários
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso de Segurança:</strong> Todas as ações administrativas são registradas 
          em logs de auditoria. Utilize essas funcionalidades com responsabilidade.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {user.full_name || 'Nome não informado'}
                  </CardTitle>
                  <CardDescription>
                    {user.email}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Usuário
                          </>
                        )}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Sem papel</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  {/* Botão para atribuir papel de admin */}
                  {!hasRole(user, 'admin') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleAction('assign');
                            setTargetRole('admin');
                          }}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Tornar Admin
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Atribuição de Admin</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>Deseja tornar <strong>{user.full_name || user.email}</strong> um administrador?</p>
                            <p className="text-orange-600 font-medium">
                              ⚠️ Administradores têm acesso total ao sistema, incluindo 
                              gerenciamento de usuários e dados sensíveis.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Esta ação será registrada nos logs de auditoria.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRoleAction}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Botão para atribuir papel de usuário */}
                  {!hasRole(user, 'user') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        await assignRole(user.id, 'user');
                        await logSecurityEvent('role_assigned', {
                          targetUserId: user.id,
                          targetEmail: user.email,
                          role: 'user'
                        });
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Tornar Usuário
                    </Button>
                  )}

                  {/* Botão para remover papel de admin */}
                  {hasRole(user, 'admin') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleAction('remove');
                            setTargetRole('admin');
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remover Admin
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Remoção de Admin</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>Deseja remover privilégios de administrador de <strong>{user.full_name || user.email}</strong>?</p>
                            <p className="text-sm text-muted-foreground">
                              Esta ação será registrada nos logs de auditoria e não pode ser desfeita automaticamente.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleRoleAction}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Botão para remover usuário */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover Usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Remoção Permanente</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>Deseja remover permanentemente o usuário <strong>{user.full_name || user.email}</strong>?</p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 font-medium text-sm">
                              ⚠️ <strong>AÇÃO IRREVERSÍVEL:</strong> Todos os dados do usuário serão perdidos permanentemente.
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Esta ação será registrada nos logs de auditoria.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={async () => {
                            if (selectedUser) {
                              await handleDeleteUser(selectedUser);
                              setSelectedUser(null);
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover Permanentemente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum usuário encontrado no sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
