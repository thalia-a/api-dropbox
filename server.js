const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// ==========================
// FIREBASE CONFIG (DUAL MODE)
// ==========================

let serviceAccount;

if (process.env.FIREBASE_KEY) {
  console.log("Using ENV Firebase Key");
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
} else {
  console.log("Using LOCAL Firebase Key");
  serviceAccount = require("./serviceAccount.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ==========================
// ROUTES
// ==========================

// TEST ROOT
app.get("/", (req, res) => {
  res.send("API RUNNING");
});

// ENDPOINT DARI ESP32
app.post("/sensor", async (req, res) => {
  try {
    const { device_id, volume_pct, distance_cm, height_cm, status } = req.body;

    if (volume_pct === undefined) {
      return res.status(400).json({ error: "volume_pct required" });
    }

    const id = device_id || "DBX-A";

    await db.collection("dropbox").doc(id).set({
      volume_pct: Number(volume_pct),
      distance_cm,
      height_cm,
      status,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Data masuk:", req.body);

    res.json({ status: "success" });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error" });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});