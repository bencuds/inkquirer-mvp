// server.js
import express from "express";
import ViteExpress from "vite-express";
import emailRouter from "./server/sendEmail.js";

const app = express();

app.use(express.json());
app.use("/api", emailRouter); // backend route

ViteExpress.listen(app, 5173, () => {
  console.log("🚀 Vite + Express server running on http://localhost:5173");
});
