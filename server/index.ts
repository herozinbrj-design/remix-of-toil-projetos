import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { prisma } from "./prisma.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import permissionsRoutes from "./routes/permissions.js";
import clientsRoutes from "./routes/clients.js";
import servicesRoutes from "./routes/services.js";
import portfolioRoutes from "./routes/portfolio.js";
import leadsRoutes from "./routes/leads.js";
import segmentsRoutes from "./routes/segments.js";
import bannersRoutes from "./routes/banners.js";
import settingsRoutes from "./routes/settings.js";
import uploadRoutes from "./routes/upload.js";
import seoRoutes from "./routes/seo.js";
import smtpTestRoutes from "./routes/smtp-test.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (imagens e uploads) — cache longo pois nomes são únicos (timestamp)
app.use("/images", express.static(path.join(process.cwd(), "public", "images"), { maxAge: "1y", immutable: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads"), { maxAge: "1y", immutable: true }));

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/roles", permissionsRoutes); // Same routes for /api/roles/:role/permissions
app.use("/api/clients", clientsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/segments", segmentsRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/smtp", smtpTestRoutes);
app.use("/", seoRoutes);

// Servir frontend SPA em produção (quando dist/ existir)
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  // Assets com hash de conteúdo — cache longo
  app.use("/assets", express.static(path.join(distPath, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
