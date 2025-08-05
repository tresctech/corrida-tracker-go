
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateFileUpload, logSecurityEvent } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

interface SecureFileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  accept?: string;
  maxSizeText?: string;
  bucket?: string;
  folder?: string;
}

export const SecureFileUpload = ({ 
  onFileUploaded, 
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.txt',
  maxSizeText = '10MB',
  bucket = 'race-documents',
  folder = 'uploads'
}: SecureFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const validation = validateFileUpload(file);
    
    if (!validation.isValid) {
      toast({
        title: "Arquivo inválido",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Create secure filename with timestamp and user ID
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${folder}/${user.id}/${timestamp}_${sanitizeFileName(selectedFile.name)}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      await logSecurityEvent('file_uploaded', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        bucket,
        path: fileName
      });

      onFileUploaded(publicUrl, selectedFile.name);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `${selectedFile.name} foi enviado com segurança.`,
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      await logSecurityEvent('file_upload_failed', {
        fileName: selectedFile.name,
        error: error.message
      });
      
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Upload seguro: arquivos são validados e escaneados antes do armazenamento.
          Máximo: {maxSizeText}. Tipos permitidos: PDF, JPG, PNG, WebP, TXT.
        </AlertDescription>
      </Alert>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-4">
          Arraste e solte seu arquivo aqui, ou clique para selecionar
        </p>
        
        <Input
          ref={fileInputRef}
          type="file"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          accept={accept}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Selecionar Arquivo
        </Button>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={uploadFile}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Upload'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
