import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,OPTIONS",
  credentials: true // optional: only if you're using cookies or auth headers
};
import cookieParser from "cookie-parser";

app.use(cookieParser()); // 🔥 Add this before your routes

app.use(cors(corsOptions));
app.use(express.text({ type: "text/plain" }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Server is running");
});

import AuthRouter from "./routes/v1/auth.router";
app.use("/api/v1/auth", AuthRouter);

// import AuthRouter from "./routes/auth.routes";
// app.use("/api/v1/auth", AuthRouter);

import ProtocolsRouter from "./routes/v1/protocools.routes";
app.use("/api/v1/protocols", ProtocolsRouter);

import BooksRouter from "./routes/v1/books.router";
app.use("/api/v1/books", BooksRouter);
export default app;
