import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("passenger"), // passenger, operator, agent, admin
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  license: text("license").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, suspended
  createdAt: timestamp("created_at").defaultNow(),
});

export const buses = pgTable("buses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").notNull().references(() => operators.id),
  busNumber: text("bus_number").notNull(),
  busType: text("bus_type").notNull(), // AC Sleeper, Semi-Sleeper, Seater
  totalSeats: integer("total_seats").notNull(),
  amenities: json("amenities").$type<string[]>(),
  status: text("status").notNull().default("active"), // active, maintenance, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").notNull().references(() => buses.id),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  operatingDays: json("operating_days").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  routeId: varchar("route_id").notNull().references(() => routes.id),
  passengerName: text("passenger_name").notNull(),
  passengerPhone: text("passenger_phone").notNull(),
  passengerEmail: text("passenger_email"),
  seatNumbers: json("seat_numbers").$type<string[]>().notNull(),
  bookingDate: text("booking_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method"), // cash, card, mobile_money, paypal
  bookingStatus: text("booking_status").notNull().default("confirmed"), // confirmed, cancelled
  bookedBy: text("booked_by").notNull().default("passenger"), // passenger, agent
  agentId: varchar("agent_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
  createdAt: true,
});

export const insertBusSchema = createInsertSchema(buses).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Operator = typeof operators.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;

export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

// Extended types for joins
export type RouteWithBusAndOperator = Route & {
  bus: Bus & {
    operator: Operator;
  };
};

export type BookingWithRouteAndBus = Booking & {
  route: RouteWithBusAndOperator;
};
