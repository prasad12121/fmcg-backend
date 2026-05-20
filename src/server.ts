import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import brandRoutes from "./routes/brand.routes";
import categoryRoutes from "./routes/category.routes";
import unitRoutes from "./routes/unit.routes";
import unitCategoryRoutes from "./routes/unitCategory.routes";
import variantRoutes from "./routes/variant.routes";
import countryRoutes from "./routes/countries.routes";
import stateRoutes from "./routes/state.routes";
import cityRoutes from "./routes/city.routes";
import areaRoutes from "./routes/area.routes";
import subAreaRoutes from "./routes/subArea.routes";
import beatRoutes from "./routes/beat.routes";
import distributorRoutes from "./routes/distributor.route";
import outletRoutes from "./routes/outlet.routes";
import stockRoutes from "./routes/stock.routes";
import invoiceRoutes from "./routes/invoice.routes";
import driverRoutes from "./routes/driver.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import dispatchRoutes from "./routes/dispatch.routes";
import returnsRoutes from "./routes/returns.routes";
import paymentRoutes from "./routes/payment.routes";

connectDB();

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 5000);
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/unitCategories", unitCategoryRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/subAreas", subAreaRoutes);
app.use("/api/beats", beatRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/returns", returnsRoutes);
app.use("/api/payments", paymentRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    const message =
      process.env.NODE_ENV !== "production" && err instanceof Error
        ? err.message
        : "Internal server error";
    res.status(500).json({ message });
  }
);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
