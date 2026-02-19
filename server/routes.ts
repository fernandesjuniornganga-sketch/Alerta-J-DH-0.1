import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertSOSAlertSchema, insertReportSchema, insertSafeStationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/sos", async (req, res) => {
    try {
      const data = insertSOSAlertSchema.parse(req.body);
      const alert = await storage.createSOSAlert(data);
      res.json(alert);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/sos", async (_req, res) => {
    try {
      const alerts = await storage.getSOSAlerts();
      res.json(alerts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const data = insertReportSchema.parse(req.body);
      const report = await storage.createReport(data);
      res.json(report);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/safe-stations", async (_req, res) => {
    try {
      const stations = await storage.getSafeStations();
      res.json(stations);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/safe-stations", async (req, res) => {
    try {
      const data = insertSafeStationSchema.parse(req.body);
      const station = await storage.createSafeStation(data);
      res.json(station);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/resources", async (_req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
