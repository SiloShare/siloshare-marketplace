import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PhotoUploaderProps {
  maxPhotos?: number;
  minPhotos?: number;
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  initialPhotos?: UploadedPhoto[];
}

export interface UploadedPhoto {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
  progress?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploader({
  maxPhotos = 10,
  minPhotos = 3,
  onPhotosChange,
  initialPhotos = [],
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.generatePhotoUploadUrl.useMutation();

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Apenas arquivos JPG, PNG ou WEBP são permitidos.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "O arquivo deve ter no máximo 5MB.";
    }
    return null;
  };

  // Fazer upload de uma foto para o S3
  const uploadPhoto = async (file: File, photoId: string) => {
    try {
      // 1. Obter URL de upload do backend
      const { uploadUrl, fileUrl } = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 2. Fazer upload direto para o S3
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da foto");
      }

      // 3. Atualizar estado com a URL final
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, url: fileUrl, uploading: false, progress: 100 }
            : p
        )
      );

      return fileUrl;
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload da foto");
      
      // Remover foto com erro
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      throw error;
    }
  };

  // Processar arquivos selecionados
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxPhotos - photos.length;

      if (fileArray.length > remainingSlots) {
        toast.error(`Você pode adicionar no máximo ${maxPhotos} fotos.`);
        return;
      }

      // Validar todos os arquivos
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Criar previews temporários
      const newPhotos: UploadedPhoto[] = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        uploading: true,
        progress: 0,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);

      // Fazer upload de cada foto
      for (const photo of newPhotos) {
        if (photo.file) {
          await uploadPhoto(photo.file, photo.id);
        }
      }
    },
    [photos.length, maxPhotos]
  );

  // Atualizar callback quando fotos mudarem
  useState(() => {
    const uploadedPhotos = photos.filter((p) => !p.uploading);
    onPhotosChange(uploadedPhotos);
  });

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remover foto
  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    const updatedPhotos = photos.filter((p) => p.id !== id && !p.uploading);
    onPhotosChange(updatedPhotos);
  };

  // Abrir seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-black bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
        <p className="text-gray-600 mb-2">
          Arraste fotos ou clique para selecionar
        </p>
        <p className="text-sm text-gray-500">
          Mínimo {minPhotos} fotos, máximo {maxPhotos} fotos (JPG, PNG ou WEBP,
          até 5MB cada)
        </p>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
            >
              {/* Imagem */}
              <img
                src={photo.url}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* Overlay de loading */}
              {photo.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {/* Botão de remover */}
              {!photo.uploading && (
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="
                    absolute top-2 right-2 p-1.5 bg-white rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity
                    hover:bg-gray-100
                  "
                >
                  <X className="w-4 h-4 text-black" strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contador de fotos */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {photos.filter((p) => !p.uploading).length} de {maxPhotos} fotos
        </span>
        {photos.filter((p) => !p.uploading).length < minPhotos && (
          <span className="text-red-600">
            Adicione pelo menos {minPhotos} fotos
          </span>
        )}
      </div>
    </div>
  );
}

