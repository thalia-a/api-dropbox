const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// ==========================
// FIREBASE CONFIG (DUAL MODE)
// ==========================

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ==========================
// ROUTES
// ==========================

// TEST ROOT
app.get("/", (req, res) => {
  res.send("API RUNNING 🚀");
});

// ENDPOINT DARI ESP32
app.post("/sensor", async (req, res) => {
  try {
    const { volume_pct } = req.body;

    // Validasi sederhana
    if (volume_pct === undefined) {
      return res.status(400).json({ error: "volume_pct required" });
    }

    await db.collection("dropbox").doc("DBX-A").set({
      volume_pct: Number(volume_pct),
      updated_at: new Date().toISOString(),
    });

    console.log("✅ Data masuk:", volume_pct);

    res.json({ status: "success" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ status: "error" });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});