import express from "express";
import { Resend } from "resend";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running. Use POST /apply.");
});

app.post("/apply", async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev";

    if (!resendKey) {
      return res.status(500).json({
        ok: false,
        error: "Missing RESEND_API_KEY.",
      });
    }

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: "We received your application",
      text: `Hi ${fullName},

We received your application:

Name: ${fullName}
Phone: ${phone}

Thanks,
Questie Team`,
    });

    if (error) {
      throw new Error(error.message || "Failed to send email.");
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Failed to send email.",
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
