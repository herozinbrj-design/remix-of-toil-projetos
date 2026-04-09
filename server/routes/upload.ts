import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { authMiddleware } from "../middleware/auth.js";

// MIME types that should NOT be converted to WebP
const SKIP_WEBP = new Set(["image/svg+xml", "image/gif", "image/webp"]);

async function toWebP(file: Express.Multer.File): Promise<{ filename: string; path: string }> {
  if (SKIP_WEBP.has(file.mimetype)) return { filename: file.filename, path: file.path };
  const webpFilename = file.filename.replace(/\.[^.]+$/, "") + ".webp";
  const webpPath = path.join(path.dirname(file.path), webpFilename);
  await sharp(file.path)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(webpPath);
  fs.unlinkSync(file.path);
  return { filename: webpFilename, path: webpPath };
}

const BASE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_SECTIONS = ["banners", "services", "portfolio", "settings", "segments", "carousel", "clients"] as const;
type Section = (typeof ALLOWED_SECTIONS)[number];

function getSectionDir(section?: string): string {
  const s = ALLOWED_SECTIONS.includes(section as Section) ? (section as Section) : "general";
  const dir = path.join(BASE_UPLOAD_DIR, s);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Ensure base dir exists
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const section = (req.query.section as string) || (req.body?.section as string);
    cb(null, getSectionDir(section));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido. Use: JPG, PNG, WebP, SVG ou GIF"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "Arquivo muito grande. Máximo: 20MB" });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
}

const router = Router();
router.use(authMiddleware);

// POST /api/upload?section=banners (single file)
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Nenhum arquivo enviado" });
    return;
  }
  const section = (req.query.section as string) || "general";
  try {
    const converted = await toWebP(req.file);
    const url = `/uploads/${section}/${converted.filename}`;
    res.json({ url, filename: converted.filename, section });
  } catch {
    const url = `/uploads/${section}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, section });
  }
});

// POST /api/upload/multiple?section=portfolio (multiple files)
router.post("/multiple", upload.array("images", 10), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: "Nenhum arquivo enviado" });
    return;
  }
  const section = (req.query.section as string) || "general";
  const urls = await Promise.all(
    files.map(async (f) => {
      try {
        const converted = await toWebP(f);
        return { url: `/uploads/${section}/${converted.filename}`, filename: converted.filename, section };
      } catch {
        return { url: `/uploads/${section}/${f.filename}`, filename: f.filename, section };
      }
    })
  );
  res.json(urls);
});

// DELETE /api/upload/:section/:filename (new format)
router.delete("/:section/:filename", (req, res) => {
  const section = path.basename(req.params.section);
  const filename = path.basename(req.params.filename);
  const filePath = path.join(BASE_UPLOAD_DIR, section, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Arquivo não encontrado" });
    return;
  }

  fs.unlinkSync(filePath);
  res.json({ message: "Arquivo removido" });
});

// DELETE /api/upload/:filename (legacy — searches all subdirs)
router.delete("/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const candidates = [
    path.join(BASE_UPLOAD_DIR, filename),
    ...ALLOWED_SECTIONS.map((s) => path.join(BASE_UPLOAD_DIR, s, filename)),
    path.join(BASE_UPLOAD_DIR, "general", filename),
  ];
  const found = candidates.find((p) => fs.existsSync(p));

  if (!found) {
    res.status(404).json({ error: "Arquivo não encontrado" });
    return;
  }

  fs.unlinkSync(found);
  res.json({ message: "Arquivo removido" });
});

router.use(handleMulterError);

export default router;
