import { 
  type User, 
  type InsertUser, 
  type Operator, 
  type InsertOperator,
  type Bus,
  type InsertBus,
  type Route,
  type InsertRoute,
  type Booking,
  type InsertBooking,
  type Complaint,
  type InsertComplaint,
  type RouteWithBusAndOperator,
  type BookingWithRouteAndBus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Operator management
  getOperator(id: string): Promise<Operator | undefined>;
  getOperatorByUserId(userId: string): Promise<Operator | undefined>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperator(id: string, updates: Partial<Operator>): Promise<Operator | undefined>;
  getOperatorsByStatus(status: string): Promise<Operator[]>;

  // Bus management
  getBus(id: string): Promise<Bus | undefined>;
  getBusesByOperator(operatorId: string): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: string, updates: Partial<Bus>): Promise<Bus | undefined>;
  deleteBus(id: string): Promise<boolean>;

  // Route management
  getRoute(id: string): Promise<Route | undefined>;
  getRoutesByBus(busId: string): Promise<Route[]>;
  searchRoutes(fromCity: string, toCity: string, date: string): Promise<RouteWithBusAndOperator[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined>;
  deleteRoute(id: string): Promise<boolean>;

  // Booking management
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<BookingWithRouteAndBus[]>;
  getBookingsByRoute(routeId: string, date: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  getBookingsByOperator(operatorId: string): Promise<BookingWithRouteAndBus[]>;

  // Complaint management
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaintsByUser(userId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined>;
  getAllComplaints(): Promise<Complaint[]>;

  // Analytics
  getBookingStats(): Promise<any>;
  getOperatorRevenue(operatorId: string): Promise<any>;
  getPlatformStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private operators: Map<string, Operator>;
  private buses: Map<string, Bus>;
  private routes: Map<string, Route>;
  private bookings: Map<string, Booking>;
  private complaints: Map<string, Complaint>;

  constructor() {
    this.users = new Map();
    this.operators = new Map();
    this.buses = new Map();
    this.routes = new Map();
    this.bookings = new Map();
    this.complaints = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123", // In real app, hash this
      email: "admin@mobus.com",
      role: "admin",
      name: "System Admin",
      phone: "+1-555-0001",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create operator user and operator
    const operatorUser: User = {
      id: randomUUID(),
      username: "expresslines",
      password: "operator123",
      email: "contact@expresslines.com",
      role: "operator",
      name: "Express Lines Manager",
      phone: "+1-555-0002",
      createdAt: new Date(),
    };
    this.users.set(operatorUser.id, operatorUser);

    const operator: Operator = {
      id: randomUUID(),
      userId: operatorUser.id,
      companyName: "Express Lines",
      license: "LIC123456789",
      contactEmail: "contact@expresslines.com",
      contactPhone: "+1-555-0002",
      status: "approved",
      createdAt: new Date(),
    };
    this.operators.set(operator.id, operator);

    // Create agent user
    const agentUser: User = {
      id: randomUUID(),
      username: "agent1",
      password: "agent123",
      email: "agent1@mobus.com",
      role: "agent",
      name: "John Agent",
      phone: "+1-555-0003",
      createdAt: new Date(),
    };
    this.users.set(agentUser.id, agentUser);

    // Create sample buses
    const bus1: Bus = {
      id: randomUUID(),
      operatorId: operator.id,
      busNumber: "EL001",
      busType: "AC Sleeper",
      totalSeats: 36,
      amenities: ["WiFi", "Charging Port", "Entertainment", "Blanket"],
      status: "active",
      createdAt: new Date(),
    };
    this.buses.set(bus1.id, bus1);

    const bus2: Bus = {
      id: randomUUID(),
      operatorId: operator.id,
      busNumber: "EL002",
      busType: "Semi-Sleeper",
      totalSeats: 40,
      amenities: ["WiFi", "Charging Port"],
      status: "active",
      createdAt: new Date(),
    };
    this.buses.set(bus2.id, bus2);

    // Create sample routes
    const route1: Route = {
      id: randomUUID(),
      busId: bus1.id,
      fromCity: "New York",
      toCity: "Boston",
      departureTime: "08:00",
      arrivalTime: "14:00",
      duration: "6h 0m",
      price: "45.00",
      operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      isActive: true,
      createdAt: new Date(),
    };
    this.routes.set(route1.id, route1);

    const route2: Route = {
      id: randomUUID(),
      busId: bus2.id,
      fromCity: "New York",
      toCity: "Boston",
      departureTime: "10:30",
      arrivalTime: "16:45",
      duration: "6h 15m",
      price: "38.00",
      operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      isActive: true,
      createdAt: new Date(),
    };
    this.routes.set(route2.id, route2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || 'passenger',
      name: insertUser.name || null,
      email: insertUser.email || null,
      phone: insertUser.phone || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Operator methods
  async getOperator(id: string): Promise<Operator | undefined> {
    return this.operators.get(id);
  }

  async getOperatorByUserId(userId: string): Promise<Operator | undefined> {
    return Array.from(this.operators.values()).find(op => op.userId === userId);
  }

  async createOperator(insertOperator: InsertOperator): Promise<Operator> {
    const id = randomUUID();
    const operator: Operator = { 
      ...insertOperator, 
      id, 
      createdAt: new Date(),
      status: insertOperator.status || 'pending'
    };
    this.operators.set(id, operator);
    return operator;
  }

  async updateOperator(id: string, updates: Partial<Operator>): Promise<Operator | undefined> {
    const operator = this.operators.get(id);
    if (!operator) return undefined;
    const updatedOperator = { ...operator, ...updates };
    this.operators.set(id, updatedOperator);
    return updatedOperator;
  }

  async getOperatorsByStatus(status: string): Promise<Operator[]> {
    return Array.from(this.operators.values()).filter(op => op.status === status);
  }

  // Bus methods
  async getBus(id: string): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async getBusesByOperator(operatorId: string): Promise<Bus[]> {
    return Array.from(this.buses.values()).filter(bus => bus.operatorId === operatorId);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const id = randomUUID();
    const bus: Bus = { 
      ...insertBus, 
      id, 
      createdAt: new Date(),
      status: insertBus.status || 'active',
      amenities: insertBus.amenities || null
    };
    this.buses.set(id, bus);
    return bus;
  }

  async updateBus(id: string, updates: Partial<Bus>): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (!bus) return undefined;
    const updatedBus = { ...bus, ...updates };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }

  async deleteBus(id: string): Promise<boolean> {
    return this.buses.delete(id);
  }

  // Route methods
  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getRoutesByBus(busId: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => route.busId === busId);
  }

  async searchRoutes(fromCity: string, toCity: string, date: string): Promise<RouteWithBusAndOperator[]> {
    const routes = Array.from(this.routes.values()).filter(route => 
      route.fromCity.toLowerCase().includes(fromCity.toLowerCase()) &&
      route.toCity.toLowerCase().includes(toCity.toLowerCase()) &&
      route.isActive
    );

    const routesWithDetails = await Promise.all(
      routes.map(async (route) => {
        const bus = this.buses.get(route.busId);
        const operator = bus ? this.operators.get(bus.operatorId) : undefined;
        
        if (bus && operator) {
          return {
            ...route,
            bus: {
              ...bus,
              operator
            }
          };
        }
        return null;
      })
    );

    return routesWithDetails.filter((r): r is RouteWithBusAndOperator => r !== null);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = { 
      ...insertRoute, 
      id, 
      createdAt: new Date(),
      operatingDays: insertRoute.operatingDays || null,
      isActive: insertRoute.isActive !== undefined ? insertRoute.isActive : true
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    const updatedRoute = { ...route, ...updates };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: string): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<BookingWithRouteAndBus[]> {
    const userBookings = Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
    
    const bookingsWithDetails = await Promise.all(
      userBookings.map(async (booking) => {
        const route = this.routes.get(booking.routeId);
        if (!route) return null;
        
        const bus = this.buses.get(route.busId);
        const operator = bus ? this.operators.get(bus.operatorId) : undefined;
        
        if (bus && operator) {
          return {
            ...booking,
            route: {
              ...route,
              bus: {
                ...bus,
                operator
              }
            }
          };
        }
        return null;
      })
    );

    return bookingsWithDetails.filter((b): b is BookingWithRouteAndBus => b !== null);
  }

  async getBookingsByRoute(routeId: string, date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => 
      booking.routeId === routeId && booking.bookingDate === date
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      userId: insertBooking.userId || null,
      passengerEmail: insertBooking.passengerEmail || null,
      paymentMethod: insertBooking.paymentMethod || null,
      agentId: insertBooking.agentId || null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getBookingsByOperator(operatorId: string): Promise<BookingWithRouteAndBus[]> {
    const operatorBuses = Array.from(this.buses.values()).filter(bus => bus.operatorId === operatorId);
    const busIds = operatorBuses.map(bus => bus.id);
    const operatorRoutes = Array.from(this.routes.values()).filter(route => busIds.includes(route.busId));
    const routeIds = operatorRoutes.map(route => route.id);
    
    const operatorBookings = Array.from(this.bookings.values()).filter(booking => 
      routeIds.includes(booking.routeId)
    );

    const bookingsWithDetails = await Promise.all(
      operatorBookings.map(async (booking) => {
        const route = this.routes.get(booking.routeId);
        if (!route) return null;
        
        const bus = this.buses.get(route.busId);
        const operator = this.operators.get(operatorId);
        
        if (bus && operator) {
          return {
            ...booking,
            route: {
              ...route,
              bus: {
                ...bus,
                operator
              }
            }
          };
        }
        return null;
      })
    );

    return bookingsWithDetails.filter((b): b is BookingWithRouteAndBus => b !== null);
  }

  // Complaint methods
  async getComplaint(id: string): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaintsByUser(userId: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.userId === userId);
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = randomUUID();
    const complaint: Complaint = { 
      ...insertComplaint, 
      id, 
      createdAt: new Date(),
      status: insertComplaint.status || 'open',
      priority: insertComplaint.priority || 'medium',
      userId: insertComplaint.userId || null,
      bookingId: insertComplaint.bookingId || null
    };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    const updatedComplaint = { ...complaint, ...updates };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  // Analytics methods
  async getBookingStats(): Promise<any> {
    const bookings = Array.from(this.bookings.values());
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);

    return {
      totalBookings,
      totalRevenue,
      paidBookings: paidBookings.length,
      pendingBookings: bookings.filter(b => b.paymentStatus === 'pending').length,
    };
  }

  async getOperatorRevenue(operatorId: string): Promise<any> {
    const bookings = await this.getBookingsByOperator(operatorId);
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);

    return {
      totalBookings: bookings.length,
      totalRevenue,
      paidBookings: paidBookings.length,
    };
  }

  async getPlatformStats(): Promise<any> {
    const users = Array.from(this.users.values());
    const operators = Array.from(this.operators.values());
    const complaints = Array.from(this.complaints.values());
    const bookingStats = await this.getBookingStats();

    return {
      totalUsers: users.length,
      totalOperators: operators.length,
      pendingOperators: operators.filter(o => o.status === 'pending').length,
      totalComplaints: complaints.length,
      openComplaints: complaints.filter(c => c.status === 'open').length,
      ...bookingStats,
    };
  }
}

export const storage = new MemStorage();
