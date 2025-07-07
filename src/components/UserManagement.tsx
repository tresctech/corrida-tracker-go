import { useState } from 'react';
import { useUserManagement, UserProfile } from '@/hooks/useUserManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { users, loading, assignRole, removeRole } = useUserManagement();
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

    if (roleAction === 'assign') {
      await assignRole(selectedUser.id, targetRole);
    } else {
      await removeRole(selectedUser.id, targetRole);
    }

    setSelectedUser(null);
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
                          <AlertDialogTitle>Confirmar Atribuição</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja tornar <strong>{user.full_name || user.email}</strong> um administrador?
                            Administradores têm acesso total ao sistema.
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
                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja remover privilégios de administrador de <strong>{user.full_name || user.email}</strong>?
                            Esta ação não pode ser desfeita automaticamente.
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