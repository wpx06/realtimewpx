
# Stats Dashboard - Performance Analytics Platform

A comprehensive real-time analytics dashboard for tracking performance statistics, conversions, and team metrics with MySQL database integration.

## 🚀 Features

- **Live Performance Tracking**: Real-time clicks and conversions monitoring
- **Statistics Dashboard**: Comprehensive analytics with date filtering
- **Conversion Tracking**: Detailed conversion analytics and summaries
- **Team Performance**: Team ranking and performance breakdown
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience
- **MySQL Integration**: Full database support for data persistence

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Database**: MySQL
- **Backend**: Express.js, Node.js
- **Icons**: Lucide React
- **Charts**: Recharts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MySQL Server (v8.0 or higher)

## ⚡ Quick Start

### 1. Clone and Install Frontend

```bash
# Clone the repository
git clone <your-repo-url>
cd stats-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### 2. Setup MySQL Database

```sql
-- Create database
CREATE DATABASE stats_dashboard;

-- Create user (optional)
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON stats_dashboard.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Setup Backend Server

```bash
# Navigate to backend directory
cd backend-setup

# Install backend dependencies
npm install

# Copy environment variables
cp ../.env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=dashboard_user
# DB_PASSWORD=your_password
# DB_NAME=stats_dashboard

# Start backend server
npm run dev
```

### 4. Initialize Database Tables

Visit `http://localhost:3001/api/init-db` in your browser or make a POST request to initialize the database tables.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stats_dashboard

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Application Configuration
NODE_ENV=development
```

### Database Schema

The application uses the following main tables:

- **visits**: Tracks visitor clicks and interactions
- **conversions**: Stores conversion data
- **stats_summary**: Daily statistics summary
- **team_performance**: Team performance metrics

## 📱 Mobile Optimization

The application is fully responsive and optimized for mobile devices:

- Adaptive navigation layout
- Touch-friendly interfaces
- Optimized table displays
- Responsive charts and graphics

## 🎨 Customization

### Theme Configuration

The app supports dark and light themes. Theme settings are persisted in localStorage.

### Adding New Metrics

1. Update TypeScript interfaces in `src/types/index.ts`
2. Add new API endpoints in backend
3. Create corresponding frontend services
4. Update UI components

## 📊 API Endpoints

### Frontend API Service

The application includes a MySQL API service (`src/services/mysqlApi.ts`) that handles:

- Live clicks and conversions
- Statistics summaries
- Team performance data
- Date-filtered analytics

### Backend Endpoints

- `GET /api/visits/recent` - Recent visitor data
- `GET /api/conversions/recent` - Recent conversions
- `GET /api/stats/summary` - Statistics summary
- `GET /api/stats?start=date&end=date` - Filtered statistics
- `GET /api/team-performance` - Team rankings
- `POST /api/init-db` - Initialize database tables

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Deployment

1. Set up MySQL database on your server
2. Configure environment variables
3. Deploy backend server (PM2, Docker, etc.)
4. Update frontend API URL

## 🧪 Development

### Running Tests

```bash
# Run frontend tests
npm test

# Run backend tests (if implemented)
cd backend-setup && npm test
```

### Code Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── types/              # TypeScript definitions
└── config/             # Configuration files

backend-setup/
├── server.js           # Express server
├── package.json        # Backend dependencies
└── .env               # Backend environment
```

## 🔒 Security Considerations

- Use environment variables for sensitive data
- Implement proper authentication (recommended: integrate with Supabase)
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting on API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify credentials in .env file
   - Ensure database exists

2. **API Endpoints Not Working**
   - Check backend server is running on port 3001
   - Verify CORS configuration
   - Check network connectivity

3. **Mobile Layout Issues**
   - Clear browser cache
   - Check viewport meta tag
   - Verify responsive CSS classes

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review console logs for errors
- Ensure all dependencies are installed correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application currently uses mock data for demonstration. To use real data, uncomment the actual API calls in `mysqlApi.ts` and ensure your backend server is properly configured with MySQL.
