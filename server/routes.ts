import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertOperatorSchema, 
  insertBusSchema, 
  insertRouteSchema, 
  insertBookingSchema,
  insertComplaintSchema
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get additional data based on role
      let additionalData = null;
      if (user.role === 'operator') {
        additionalData = await storage.getOperatorByUserId(user.id);
      }

      res.json({ 
        user: { ...user, password: undefined }, 
        operator: additionalData 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Route search
  app.get("/api/routes/search", async (req, res) => {
    try {
      const { from, to, date } = req.query;
      
      if (!from || !to || !date) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const routes = await storage.searchRoutes(from as string, to as string, date as string);
      
      // Calculate available seats for each route
      const routesWithAvailability = await Promise.all(
        routes.map(async (route) => {
          const bookings = await storage.getBookingsByRoute(route.id, date as string);
          const bookedSeats = bookings.reduce((acc, booking) => acc.concat(booking.seatNumbers || []), [] as string[]);
          const availableSeats = route.bus.totalSeats - bookedSeats.length;
          
          return {
            ...route,
            availableSeats,
            bookedSeats
          };
        })
      );

      res.json(routesWithAvailability);
    } catch (error) {
      res.status(500).json({ message: "Failed to search routes" });
    }
  });

  // Booking management
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check seat availability
      const existingBookings = await storage.getBookingsByRoute(bookingData.routeId, bookingData.bookingDate);
      const bookedSeats = existingBookings.reduce((acc, booking) => acc.concat(booking.seatNumbers || []), [] as string[]);
      
      const requestedSeats = bookingData.seatNumbers || [];
      const conflictingSeats = requestedSeats.filter((seat: string) => bookedSeats.includes(seat));
      
      if (conflictingSeats.length > 0) {
        return res.status(400).json({ 
          message: "Some seats are already booked", 
          conflictingSeats 
        });
      }

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const updates = req.body;
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.get("/api/users/:userId/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.params.userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  // Operator routes
  app.post("/api/operators", async (req, res) => {
    try {
      const operatorData = insertOperatorSchema.parse(req.body);
      const operator = await storage.createOperator(operatorData);
      res.json(operator);
    } catch (error) {
      res.status(400).json({ message: "Invalid operator data" });
    }
  });

  app.get("/api/operators/:operatorId/buses", async (req, res) => {
    try {
      const buses = await storage.getBusesByOperator(req.params.operatorId);
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.post("/api/buses", async (req, res) => {
    try {
      const busData = insertBusSchema.parse(req.body);
      const bus = await storage.createBus(busData);
      res.json(bus);
    } catch (error) {
      res.status(400).json({ message: "Invalid bus data" });
    }
  });

  app.patch("/api/buses/:id", async (req, res) => {
    try {
      const updates = req.body;
      const bus = await storage.updateBus(req.params.id, updates);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bus" });
    }
  });

  app.delete("/api/buses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBus(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json({ message: "Bus deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(routeData);
      res.json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data" });
    }
  });

  app.get("/api/buses/:busId/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutesByBus(req.params.busId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/operators/:operatorId/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByOperator(req.params.operatorId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operator bookings" });
    }
  });

  app.get("/api/operators/:operatorId/revenue", async (req, res) => {
    try {
      const revenue = await storage.getOperatorRevenue(req.params.operatorId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : Array.from((storage as any).users.values());
      
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/operators", async (req, res) => {
    try {
      const { status } = req.query;
      const operators = status 
        ? await storage.getOperatorsByStatus(status as string)
        : Array.from((storage as any).operators.values());
      res.json(operators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operators" });
    }
  });

  app.patch("/api/admin/operators/:id", async (req, res) => {
    try {
      const updates = req.body;
      const operator = await storage.updateOperator(req.params.id, updates);
      if (!operator) {
        return res.status(404).json({ message: "Operator not found" });
      }
      res.json(operator);
    } catch (error) {
      res.status(500).json({ message: "Failed to update operator" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  // Complaint management
  app.post("/api/complaints", async (req, res) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      res.json(complaint);
    } catch (error) {
      res.status(400).json({ message: "Invalid complaint data" });
    }
  });

  app.get("/api/complaints", async (req, res) => {
    try {
      const { userId } = req.query;
      const complaints = userId 
        ? await storage.getComplaintsByUser(userId as string)
        : await storage.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.patch("/api/complaints/:id", async (req, res) => {
    try {
      const updates = req.body;
      const complaint = await storage.updateComplaint(req.params.id, updates);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
