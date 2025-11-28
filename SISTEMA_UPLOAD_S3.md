# 📤 Sistema de Upload S3 - SiloShare

## 📋 Resumo Executivo

Implementação completa de um sistema de upload de fotos e documentos com integração AWS S3, incluindo:
- Upload direto ao S3 via presigned URLs
- Validação de tipos e tamanhos de arquivo
- Preview de fotos com drag & drop
- Gerenciamento de documentos obrigatórios
- Integração no formulário de cadastro de silo

---

## 🏗️ Arquitetura

### Backend (Server)

**Serviço S3** (`/server/services/s3Upload.ts`):
- Geração de presigned URLs para upload seguro
- Validação de tipos de arquivo (imagens: JPG/PNG/WEBP, documentos: PDF)
- Validação de tamanhos (imagens: 5MB, documentos: 10MB)
- Funções para deletar arquivos
- Suporte a upload em lote

**Rotas tRPC** (`/server/routers.ts`):
- `upload.generatePhotoUploadUrl` - Gera URL para upload de foto
- `upload.generateDocumentUploadUrl` - Gera URL para upload de documento
- `upload.generateMultipleUploadUrls` - Gera múltiplas URLs (upload em lote)
- `upload.deleteFile` - Deleta arquivo do S3

### Frontend (Client)

**Componente PhotoUploader** (`/client/src/components/PhotoUploader.tsx`):
- Drag & drop de múltiplas fotos
- Preview em tempo real
- Upload assíncrono para S3
- Validação de tipo e tamanho
- Indicador de progresso
- Remoção de fotos
- Contador de fotos (mín/máx)

**Componente DocumentUploader** (`/client/src/components/DocumentUploader.tsx`):
- Lista de documentos obrigatórios e opcionais
- Upload individual de PDFs
- Indicador de status (enviado/pendente)
- Download de documentos enviados
- Validação de documentos obrigatórios

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=silosharebucket
```

### Dependências Instaladas

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

---

## 📸 Componente: PhotoUploader

### Props

```typescript
interface PhotoUploaderProps {
  maxPhotos?: number;        // Máximo de fotos (padrão: 10)
  minPhotos?: number;        // Mínimo de fotos (padrão: 3)
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  initialPhotos?: UploadedPhoto[];
}

interface UploadedPhoto {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
  progress?: number;
}
```

### Uso

```tsx
<PhotoUploader
  maxPhotos={10}
  minPhotos={3}
  onPhotosChange={(photos) => {
    handleChange("fotos", photos.map(p => p.url));
  }}
  initialPhotos={dados.fotos?.map((url, index) => ({
    id: `${index}`,
    url,
  })) || []}
/>
```

### Funcionalidades

✅ **Drag & Drop**: Arraste múltiplas fotos para a área de upload
✅ **Preview**: Visualização imediata das fotos selecionadas
✅ **Validação**: Apenas JPG, PNG, WEBP até 5MB
✅ **Upload Assíncrono**: Upload direto ao S3 sem bloquear a UI
✅ **Progresso**: Indicador de loading durante upload
✅ **Remoção**: Botão para remover fotos (aparece no hover)
✅ **Contador**: Mostra quantas fotos foram adicionadas (X de Y)

---

## 📄 Componente: DocumentUploader

### Props

```typescript
interface DocumentUploaderProps {
  documentTypes: DocumentType[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  initialDocuments?: UploadedDocument[];
}

interface DocumentType {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

interface UploadedDocument {
  type: string;
  url: string;
  fileName: string;
  uploadedAt: Date;
}
```

### Uso

```tsx
const TIPOS_DOCUMENTOS: DocumentType[] = [
  {
    id: "matricula",
    label: "Matrícula do Imóvel",
    required: true,
    description: "Documento que comprova a propriedade do imóvel"
  },
  // ... outros documentos
];

<DocumentUploader
  documentTypes={TIPOS_DOCUMENTOS}
  onDocumentsChange={(documents) => {
    const docsMap: Record<string, string> = {};
    documents.forEach(doc => {
      docsMap[doc.type] = doc.url;
    });
    handleChange("documentos", docsMap);
  }}
  initialDocuments={[]}
/>
```

### Funcionalidades

✅ **Lista de Documentos**: Mostra todos os documentos necessários
✅ **Obrigatórios/Opcionais**: Indica quais são obrigatórios
✅ **Descrição**: Tooltip explicando cada documento
✅ **Upload Individual**: Botão de upload para cada documento
✅ **Status Visual**: Check verde quando enviado
✅ **Download**: Botão para baixar documento enviado
✅ **Remoção**: Botão X para remover documento
✅ **Validação**: Apenas PDF até 10MB
✅ **Progresso Geral**: Contador de documentos enviados

---

## 🔄 Fluxo de Upload

### 1. Seleção de Arquivo (Frontend)

```typescript
// Usuário seleciona arquivo (drag & drop ou clique)
const file = e.target.files[0];

// Validação local
if (!ALLOWED_TYPES.includes(file.type)) {
  toast.error("Tipo de arquivo não permitido");
  return;
}

if (file.size > MAX_FILE_SIZE) {
  toast.error("Arquivo muito grande");
  return;
}
```

### 2. Solicitação de URL de Upload (Frontend → Backend)

```typescript
// Chamar tRPC para obter presigned URL
const { uploadUrl, fileUrl } = await uploadMutation.mutateAsync({
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
});
```

### 3. Geração de Presigned URL (Backend)

```typescript
// Backend gera URL assinada válida por 15 minutos
const command = new PutObjectCommand({
  Bucket: BUCKET_NAME,
  Key: `silos/${uniqueFileName}`,
  ContentType: fileType,
});

const uploadUrl = await getSignedUrl(s3Client, command, { 
  expiresIn: 900 
});
```

### 4. Upload Direto ao S3 (Frontend → S3)

```typescript
// Upload direto do navegador para o S3
const response = await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type,
  },
});

if (!response.ok) {
  throw new Error("Erro ao fazer upload");
}
```

### 5. Atualização de Estado (Frontend)

```typescript
// Atualizar estado com a URL final do arquivo
setPhotos(prev => prev.map(p => 
  p.id === photoId 
    ? { ...p, url: fileUrl, uploading: false } 
    : p
));

// Notificar componente pai
onPhotosChange(updatedPhotos);
```

---

## 📊 Estrutura de Dados

### Fotos no Formulário

```typescript
{
  fotos: [
    "https://silosharebucket.s3.us-east-1.amazonaws.com/silos/abc123.jpg",
    "https://silosharebucket.s3.us-east-1.amazonaws.com/silos/def456.png",
    "https://silosharebucket.s3.us-east-1.amazonaws.com/silos/ghi789.webp"
  ]
}
```

### Documentos no Formulário

```typescript
{
  documentos: {
    "matricula": "https://silosharebucket.s3.us-east-1.amazonaws.com/documents/matricula-xyz.pdf",
    "cnpj_cpf": "https://silosharebucket.s3.us-east-1.amazonaws.com/documents/cnpj-abc.pdf",
    "laudo_vistoria": "https://silosharebucket.s3.us-east-1.amazonaws.com/documents/laudo-def.pdf",
    "licenca_ambiental": "https://silosharebucket.s3.us-east-1.amazonaws.com/documents/licenca-ghi.pdf",
    "alvara_funcionamento": "https://silosharebucket.s3.us-east-1.amazonaws.com/documents/alvara-jkl.pdf"
  }
}
```

---

## 🎨 Design Minimalista

Ambos os componentes seguem o kit visual minimalista Airbnb-style:

✅ **Cores**: Preto, branco e cinza
✅ **Ícones**: Lucide React com strokeWidth={1.5}
✅ **Bordas**: border-2 quando ativo/selecionado
✅ **Transições**: Suaves (transition-all duration-200)
✅ **Feedback**: Toasts para sucesso/erro
✅ **Loading**: Spinner minimalista durante upload

---

## 🔒 Segurança

### Validação em Múltiplas Camadas

1. **Frontend (Client)**:
   - Validação de tipo de arquivo
   - Validação de tamanho
   - Preview antes do upload

2. **Backend (Server)**:
   - Validação de tipo de arquivo
   - Validação de tamanho
   - Geração de URLs assinadas com expiração

3. **S3 (AWS)**:
   - Bucket privado
   - Acesso apenas via presigned URLs
   - CORS configurado

### Presigned URLs

- **Expiração**: 15 minutos
- **Permissão**: Apenas PUT (upload)
- **Escopo**: Arquivo específico (não permite listar bucket)

---

## 📁 Organização no S3

```
silosharebucket/
├── silos/
│   ├── abc123-def456-ghi789.jpg
│   ├── jkl012-mno345-pqr678.png
│   └── stu901-vwx234-yz5678.webp
├── documents/
│   ├── matricula-abc123.pdf
│   ├── cnpj-def456.pdf
│   └── laudo-ghi789.pdf
└── users/
    └── avatar-jkl012.jpg
```

---

## ✅ Validações Implementadas

### Fotos

| Validação | Valor | Mensagem de Erro |
|-----------|-------|------------------|
| Tipo | JPG, PNG, WEBP | "Apenas arquivos JPG, PNG ou WEBP são permitidos." |
| Tamanho | Máx 5MB | "O arquivo deve ter no máximo 5MB." |
| Quantidade Mín | 3 fotos | "Adicione pelo menos 3 fotos" |
| Quantidade Máx | 10 fotos | "Você pode adicionar no máximo 10 fotos." |

### Documentos

| Validação | Valor | Mensagem de Erro |
|-----------|-------|------------------|
| Tipo | PDF | "Apenas arquivos PDF são permitidos." |
| Tamanho | Máx 10MB | "O arquivo deve ter no máximo 10MB." |
| Obrigatórios | 5 docs | "Envie todos os documentos obrigatórios" |

---

## 🧪 Como Testar

### 1. Configurar AWS S3

```bash
# Criar bucket no AWS S3
aws s3 mb s3://silosharebucket

# Configurar CORS
aws s3api put-bucket-cors --bucket silosharebucket --cors-configuration file://cors.json
```

**cors.json**:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["PUT", "GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Configurar Variáveis de Ambiente

Editar `/home/ubuntu/siloshare_v2/.env`:
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=silosharebucket
```

### 3. Testar Upload de Fotos

1. Acessar `/cadastrar-silo`
2. Fazer login
3. Navegar até Etapa 5 (Fotos)
4. Arrastar 3-10 fotos (JPG/PNG/WEBP, máx 5MB cada)
5. Verificar preview e upload
6. Confirmar URLs no estado do formulário

### 4. Testar Upload de Documentos

1. Navegar até Etapa 7 (Documentos)
2. Fazer upload de cada documento obrigatório (PDF, máx 10MB)
3. Verificar status (check verde)
4. Testar download e remoção
5. Confirmar URLs no estado do formulário

---

## 🐛 Troubleshooting

### Erro: "Erro ao fazer upload da foto"

**Possíveis causas**:
1. Credenciais AWS inválidas
2. Bucket não existe
3. CORS não configurado
4. Presigned URL expirada (>15min)

**Solução**:
```bash
# Verificar credenciais
aws sts get-caller-identity

# Verificar bucket
aws s3 ls s3://silosharebucket

# Verificar CORS
aws s3api get-bucket-cors --bucket silosharebucket
```

### Erro: "Tipo de arquivo não permitido"

**Causa**: Arquivo não é JPG, PNG, WEBP (fotos) ou PDF (documentos)

**Solução**: Converter arquivo para formato aceito

### Erro: "Arquivo muito grande"

**Causa**: Arquivo excede 5MB (fotos) ou 10MB (documentos)

**Solução**: Comprimir arquivo ou reduzir qualidade

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Compressão de Imagens**:
   - Implementar compressão client-side antes do upload
   - Usar bibliotecas como `browser-image-compression`

2. **Upload com Progresso**:
   - Mostrar barra de progresso detalhada (0-100%)
   - Usar XMLHttpRequest em vez de fetch

3. **Retry Automático**:
   - Tentar novamente em caso de falha de rede
   - Exponential backoff

4. **Preview de Documentos**:
   - Mostrar preview de PDFs inline
   - Usar `react-pdf` ou similar

5. **Validação de Conteúdo**:
   - OCR para validar documentos
   - Detecção de faces em fotos

6. **CDN**:
   - Configurar CloudFront para distribuição
   - Cache de imagens

---

## 📝 Checklist de Implementação

- [x] Instalar dependências AWS SDK
- [x] Criar serviço S3 no backend
- [x] Criar rotas tRPC de upload
- [x] Criar componente PhotoUploader
- [x] Criar componente DocumentUploader
- [x] Integrar PhotoUploader no formulário (Etapa 5)
- [x] Integrar DocumentUploader no formulário (Etapa 7)
- [x] Validação de tipos de arquivo
- [x] Validação de tamanhos
- [x] Preview de fotos
- [x] Drag & drop
- [x] Indicadores de progresso
- [x] Mensagens de erro/sucesso
- [x] Design minimalista
- [ ] Configurar AWS S3 real
- [ ] Testar upload completo
- [ ] Testar com múltiplos usuários
- [ ] Otimizar performance

---

**Data**: 21 de Outubro de 2025  
**Versão**: 1.0 - Sistema de Upload S3  
**Status**: Implementado (Aguardando Configuração AWS)

