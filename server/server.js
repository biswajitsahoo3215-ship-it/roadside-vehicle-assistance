import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import createPartnerRoutes from "./routes/partnerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    methods: ["GET", "POST"]
  }
});

// Make Socket.IO available to routes
app.set("io", io);

// Middleware
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

app.use(express.json());

// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/vehicles",
  vehicleRoutes
);

app.use(
  "/api/service-requests",
  serviceRequestRoutes
);

app.use(
  "/api/partners",
  createPartnerRoutes(io)
);

app.use(
  "/api/admin",
  adminRoutes
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message:
      "Roadside Vehicle Assistance API is running"
  });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // Join a service request room
  socket.on(
    "joinServiceRequest",
    (requestId) => {
      socket.join(
        `service-request-${requestId}`
      );

      console.log(
        `Socket ${socket.id} joined service request ${requestId}`
      );
    }
  );

  // Disconnect
  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

const PORT =
  process.env.PORT || 5000;

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    server.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });