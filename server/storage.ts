import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users,
  sosAlerts,
  anonymousReports,
  safeStations,
  educationalResources,
  type User,
  type InsertUser,
  type SOSAlert,
  type InsertSOSAlert,
  type AnonymousReport,
  type InsertAnonymousReport,
  type SafeStationDB,
  type InsertSafeStation,
  type EducationalResource,
  type InsertEducationalResource,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSOSAlert(alert: InsertSOSAlert): Promise<SOSAlert>;
  getSOSAlerts(): Promise<SOSAlert[]>;
  createReport(report: InsertAnonymousReport): Promise<AnonymousReport>;
  getReports(): Promise<AnonymousReport[]>;
  getSafeStations(): Promise<SafeStationDB[]>;
  createSafeStation(station: InsertSafeStation): Promise<SafeStationDB>;
  getResources(): Promise<EducationalResource[]>;
  createResource(resource: InsertEducationalResource): Promise<EducationalResource>;
  getStats(): Promise<{ totalAlerts: number; totalReports: number; totalStations: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createSOSAlert(alert: InsertSOSAlert): Promise<SOSAlert> {
    const [result] = await db.insert(sosAlerts).values(alert).returning();
    return result;
  }

  async getSOSAlerts(): Promise<SOSAlert[]> {
    return db.select().from(sosAlerts).orderBy(desc(sosAlerts.createdAt)).limit(100);
  }

  async createReport(report: InsertAnonymousReport): Promise<AnonymousReport> {
    const [result] = await db.insert(anonymousReports).values(report).returning();
    return result;
  }

  async getReports(): Promise<AnonymousReport[]> {
    return db.select().from(anonymousReports).orderBy(desc(anonymousReports.createdAt)).limit(100);
  }

  async getSafeStations(): Promise<SafeStationDB[]> {
    return db.select().from(safeStations);
  }

  async createSafeStation(station: InsertSafeStation): Promise<SafeStationDB> {
    const [result] = await db.insert(safeStations).values(station).returning();
    return result;
  }

  async getResources(): Promise<EducationalResource[]> {
    return db.select().from(educationalResources).orderBy(educationalResources.orderIndex);
  }

  async createResource(resource: InsertEducationalResource): Promise<EducationalResource> {
    const [result] = await db.insert(educationalResources).values(resource).returning();
    return result;
  }

  async getStats(): Promise<{ totalAlerts: number; totalReports: number; totalStations: number }> {
    const alerts = await db.select().from(sosAlerts);
    const reports = await db.select().from(anonymousReports);
    const stations = await db.select().from(safeStations);
    return {
      totalAlerts: alerts.length,
      totalReports: reports.length,
      totalStations: stations.length,
    };
  }
}

export const storage = new DatabaseStorage();
