
-- Criar bucket para documentos das corridas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('race-documents', 'race-documents', true);

-- Criar política para permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload race documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'race-documents');

-- Criar política para permitir que usuários vejam seus próprios documentos
CREATE POLICY "Users can view their own race documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'race-documents');

-- Criar política para permitir que usuários deletem seus próprios documentos
CREATE POLICY "Users can delete their own race documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'race-documents');
