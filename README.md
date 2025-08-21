# BusTraveler - Bus Booking Platform

A comprehensive bus booking platform that enables passengers to search, book, and manage bus travel reservations. Built with modern full-stack architecture using React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

- **Multi-User System**: Support for passengers, bus operators, travel agents, and administrators
- **Real-time Seat Selection**: Interactive seat map with booking status
- **Route Management**: Comprehensive route and schedule management
- **Payment Processing**: Multiple payment method support
- **QR Code Tickets**: Canvas-based QR code generation for ticket validation
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Role-based Access Control**: Secure authentication and authorization

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Radix UI** + **shadcn/ui** for accessible components
- **React Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication
- **Express Sessions** for session management

### Database
- **PostgreSQL** with Neon serverless hosting
- **Drizzle Kit** for migrations and schema management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pirwoth/mobus.git
   cd mobus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**
   ```bash
   # Start PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create database and user
   sudo -u postgres psql -c "CREATE DATABASE bustraveler;"
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
   ```

4. **Set up environment variables**
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/bustraveler"
   export PORT=5000
   export NODE_ENV=development
   ```

5. **Set up database schema**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 📁 Project Structure

```
BusTraveler/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utility libraries
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
└── package.json
```

## 🔐 User Roles

- **Passenger**: Default role, can book tickets and manage bookings
- **Operator**: Can manage buses, routes, and schedules
- **Agent**: Can book tickets on behalf of passengers
- **Admin**: Full system access and user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Pirwoth Samuel** - [GitHub](https://github.com/pirwoth)

---

Made with ❤️ for modern bus travel booking
