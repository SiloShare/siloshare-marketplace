import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "silosharebucket";

// Tipos de arquivo permitidos
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

// Tamanhos máximos
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadUrlParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: "silos" | "documents" | "users";
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

/**
 * Gera uma URL assinada para upload direto ao S3
 */
export async function generateUploadUrl(
  params: UploadUrlParams
): Promise<UploadUrlResponse> {
  const { fileName, fileType, fileSize, folder } = params;

  // Validação de tipo de arquivo
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileType);

  if (!isImage && !isDocument) {
    throw new Error(
      `Tipo de arquivo não permitido: ${fileType}. Use JPG, PNG, WEBP ou PDF.`
    );
  }

  // Validação de tamanho
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (fileSize > maxSize) {
    throw new Error(
      `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`
    );
  }

  // Gerar nome único para o arquivo
  const fileExtension = fileName.split(".").pop();
  const uniqueFileName = `${randomUUID()}.${fileExtension}`;
  const key = `${folder}/${uniqueFileName}`;

  // Criar comando de upload
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  // Gerar URL assinada (válida por 15 minutos)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  // URL pública do arquivo (após upload)
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
  };
}

/**
 * Deleta um arquivo do S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Gera múltiplas URLs de upload (para upload em lote)
 */
export async function generateMultipleUploadUrls(
  files: UploadUrlParams[]
): Promise<UploadUrlResponse[]> {
  return Promise.all(files.map((file) => generateUploadUrl(file)));
}

/**
 * Valida se um arquivo é uma imagem válida
 */
export function isValidImage(fileType: string, fileSize: number): boolean {
  return (
    ALLOWED_IMAGE_TYPES.includes(fileType) && fileSize <= MAX_IMAGE_SIZE
  );
}

/**
 * Valida se um arquivo é um documento válido
 */
export function isValidDocument(fileType: string, fileSize: number): boolean {
  return (
    ALLOWED_DOCUMENT_TYPES.includes(fileType) && fileSize <= MAX_DOCUMENT_SIZE
  );
}

