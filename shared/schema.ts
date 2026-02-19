import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sosAlerts = pgTable("sos_alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  province: text("province"),
  municipality: text("municipality"),
  contactsNotified: integer("contacts_notified").default(0),
  cancelled: boolean("cancelled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const anonymousReports = pgTable("anonymous_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  description: text("description").notNull(),
  province: text("province"),
  municipality: text("municipality"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  victimAge: text("victim_age"),
  status: text("status").default("pendente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const safeStations = pgTable("safe_stations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  province: text("province").notNull(),
  municipality: text("municipality"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  type: text("type").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const educationalResources = pgTable("educational_resources", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  icon: text("icon"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSOSAlertSchema = createInsertSchema(sosAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(anonymousReports).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertSafeStationSchema = createInsertSchema(safeStations).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(educationalResources).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SOSAlert = typeof sosAlerts.$inferSelect;
export type InsertSOSAlert = z.infer<typeof insertSOSAlertSchema>;
export type AnonymousReport = typeof anonymousReports.$inferSelect;
export type InsertAnonymousReport = z.infer<typeof insertReportSchema>;
export type SafeStationDB = typeof safeStations.$inferSelect;
export type InsertSafeStation = z.infer<typeof insertSafeStationSchema>;
export type EducationalResource = typeof educationalResources.$inferSelect;
export type InsertEducationalResource = z.infer<typeof insertResourceSchema>;
