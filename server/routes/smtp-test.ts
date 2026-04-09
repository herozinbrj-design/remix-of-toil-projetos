import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { sendTestEmail } from "../lib/mailer.js";

const router = Router();

// POST /api/smtp/test (protegido - apenas admin)
router.post("/test", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: "E-mail é obrigatório" });
      return;
    }

    await sendTestEmail(email);
    res.json({ success: true, message: "E-mail de teste enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar e-mail de teste:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erro ao enviar e-mail de teste" 
    });
  }
});

export default router;
