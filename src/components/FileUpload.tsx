
import { useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  currentFile?: { url: string; name?: string };
  onRemoveFile: () => void;
}

export const FileUpload = ({ onFileUploaded, currentFile, onRemoveFile }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar um arquivo para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `race-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('race-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('race-documents')
        .getPublicUrl(filePath);

      onFileUploaded(data.publicUrl, file.name);

      toast({
        title: 'Upload realizado!',
        description: 'Arquivo enviado com sucesso.',
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (currentFile) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
        <File className="w-4 h-4 text-blue-500" />
        <span className="flex-1 text-sm text-gray-700">
          {currentFile.name || 'Comprovante anexado'}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemoveFile}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Arquivo do Comprovante</Label>
      <div className="flex items-center gap-2">
        <Input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={uploadFile}
          disabled={uploading}
          className="flex-1"
        />
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Upload className="w-4 h-4 animate-pulse" />
            Enviando...
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
      </p>
    </div>
  );
};
