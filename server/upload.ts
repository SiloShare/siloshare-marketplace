import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const router = Router();

// Configurar o diretório de uploads
const uploadDir = path.join(process.cwd(), "public", "uploads");

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar o multer para armazenamento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    cb(null, filename);
  },
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Endpoint para upload de uma única imagem
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("[Upload] Erro:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});

// Endpoint para upload de múltiplas imagens
router.post("/upload-multiple", upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const files = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("[Upload] Erro:", error);
    res.status(500).json({ error: "Erro ao fazer upload dos arquivos" });
  }
});

// Endpoint para deletar um arquivo
router.delete("/upload/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "Arquivo deletado com sucesso" });
    } else {
      res.status(404).json({ error: "Arquivo não encontrado" });
    }
  } catch (error) {
    console.error("[Upload] Erro ao deletar:", error);
    res.status(500).json({ error: "Erro ao deletar arquivo" });
  }
});

export default router;
