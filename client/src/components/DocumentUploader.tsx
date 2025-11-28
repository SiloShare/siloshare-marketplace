import { useState } from "react";
import { FileText, Upload, Check, X, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export interface DocumentType {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface UploadedDocument {
  type: string;
  url: string;
  fileName: string;
  uploadedAt: Date;
}

interface DocumentUploaderProps {
  documentTypes: DocumentType[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  initialDocuments?: UploadedDocument[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf"];

export function DocumentUploader({
  documentTypes,
  onDocumentsChange,
  initialDocuments = [],
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<Map<string, UploadedDocument>>(
    new Map(initialDocuments.map((doc) => [doc.type, doc]))
  );
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  const uploadMutation = trpc.upload.generateDocumentUploadUrl.useMutation();

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Apenas arquivos PDF são permitidos.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "O arquivo deve ter no máximo 10MB.";
    }
    return null;
  };

  // Fazer upload de um documento
  const uploadDocument = async (file: File, documentType: string) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Marcar como fazendo upload
    setUploading((prev) => new Set(prev).add(documentType));

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
        throw new Error("Erro ao fazer upload do documento");
      }

      // 3. Atualizar estado com o documento
      const newDocument: UploadedDocument = {
        type: documentType,
        url: fileUrl,
        fileName: file.name,
        uploadedAt: new Date(),
      };

      setDocuments((prev) => {
        const updated = new Map(prev);
        updated.set(documentType, newDocument);
        return updated;
      });

      // Notificar mudança
      const allDocuments = Array.from(documents.values());
      allDocuments.push(newDocument);
      onDocumentsChange(allDocuments);

      toast.success("Documento enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload do documento");
    } finally {
      // Remover da lista de upload
      setUploading((prev) => {
        const updated = new Set(prev);
        updated.delete(documentType);
        return updated;
      });
    }
  };

  // Remover documento
  const removeDocument = (documentType: string) => {
    setDocuments((prev) => {
      const updated = new Map(prev);
      updated.delete(documentType);
      return updated;
    });

    const allDocuments = Array.from(documents.values()).filter(
      (doc) => doc.type !== documentType
    );
    onDocumentsChange(allDocuments);
  };

  // Verificar se todos os documentos obrigatórios foram enviados
  const allRequiredUploaded = documentTypes
    .filter((dt) => dt.required)
    .every((dt) => documents.has(dt.id));

  return (
    <div className="space-y-4">
      {/* Lista de documentos */}
      <div className="space-y-3">
        {documentTypes.map((docType) => {
          const isUploaded = documents.has(docType.id);
          const isUploading = uploading.has(docType.id);
          const document = documents.get(docType.id);

          return (
            <div
              key={docType.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info do documento */}
                <div className="flex items-start gap-3 flex-1">
                  <FileText
                    className="w-6 h-6 text-gray-600 mt-0.5"
                    strokeWidth={1.5}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {docType.label}
                      </h4>
                      {docType.required && (
                        <span className="text-xs text-red-600 font-medium">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    {docType.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {docType.description}
                      </p>
                    )}
                    {isUploaded && document && (
                      <div className="flex items-center gap-2 mt-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {document.fileName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </div>
                  ) : isUploaded && document ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.url, "_blank")}
                        className="text-gray-600 hover:text-black"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(docType.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadDocument(file, docType.id);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Upload
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status geral */}
      <div className="flex items-center justify-between text-sm pt-2 border-t">
        <span className="text-gray-600">
          {documents.size} de {documentTypes.length} documentos enviados
        </span>
        {!allRequiredUploaded && (
          <span className="text-red-600">
            Envie todos os documentos obrigatórios
          </span>
        )}
        {allRequiredUploaded && (
          <span className="text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            Todos os documentos obrigatórios enviados
          </span>
        )}
      </div>
    </div>
  );
}

