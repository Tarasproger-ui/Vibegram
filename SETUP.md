# Vibegram Messenger - Complete Setup Guide

## Prerequisites

Before setting up Vibegram, ensure you have the following installed:

### Node.js & npm

1. **Download Node.js** from [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Node.js 16 or higher is required

2. **Install Node.js**
   - Run the installer and follow the steps
   - Make sure to check "Add to PATH" during installation
   - npm is included with Node.js

3. **Verify Installation**
   - Open PowerShell and run:
     ```powershell
     node --version
     npm --version
     ```
   - You should see version numbers for both

## Installation Steps

### Method 1: Automated Setup (Easiest)

1. **Run the setup script**
   ```powershell
   cd d:\Vibegram
   .\setup.bat
   ```
   This will automatically install all dependencies and create environment files.

### Method 2: Manual Setup

1. **Install Server Dependencies**
   ```powershell
   cd d:\Vibegram\server
   npm install
   ```

2. **Install Client Dependencies**
   ```powershell
   cd d:\Vibegram\client
   npm install
   ```

3. **Create Environment Files**
   ```powershell
   # Server
   cd d:\Vibegram\server
   copy .env.example .env
   
   # Client
   cd d:\Vibegram\client
   copy .env.example .env
   ```

## Running the Application

### Step 1: Start the Backend Server

Open **PowerShell** and run:
```powershell
cd d:\Vibegram\server
npm run dev
```

You should see:
```
Vibegram server running on port 5000
Database initialized
```

### Step 2: Start the Frontend Client

Open **another PowerShell** window and run:
```powershell
cd d:\Vibegram\client
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. Create a new account or login
3. Start messaging!

## Features to Test

### User Registration
1. Click "Create one" to register
2. Enter:
   - Phone: Any phone number (e.g., +1 234 567 8900)
   - Username: Any username (e.g., john_doe)
   - Password: At least 6 characters

### Friends System
1. Go to "Friends" tab
2. Search for other users
3. Send friend requests
4. Accept/Decline requests from others

### Messaging
1. Go to "Chat" tab
2. Click on a friend to open conversation
3. Type and send messages
4. See typing indicators in real-time

## Development

### Server Development

The server runs with hot-reload using `tsx`:
```powershell
cd server
npm run dev
```

**Server Files:**
- Routes: `src/routes/`
- Models: `src/models/`
- Utils: `src/utils/`
- Middleware: `src/middleware/`

### Client Development

The client runs with Vite hot-reload:
```powershell
cd client
npm run dev
```

**Client Files:**
- Pages: `src/pages/`
- Components: `src/components/`
- Utils: `src/utils/`
- Styles: `src/index.css`

## Building for Production

### Build Server
```powershell
cd server
npm run build
```
Output: `dist/` folder

### Build Client
```powershell
cd client
npm run build
```
Output: `dist/` folder

## Environment Variables

### Server Configuration (.env)
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
DATABASE_PATH=./vibegram.db
```

### Client Configuration (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Troubleshooting

### Port Already in Use
If you get "Address already in use" error:
```powershell
# Kill the process on port 5000 or 5173
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### npm Install Fails
```powershell
# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

### Database Issues
If you have database errors, delete the database file and restart:
```powershell
cd d:\Vibegram\server
Remove-Item vibegram.db
npm run dev
```

### Module Not Found Errors
```powershell
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

## Architecture

### Backend (Node.js + Socket.IO)
- Real-time bidirectional communication
- JWT token authentication
- SQLite database
- RESTful API endpoints
- Socket events for messaging

### Frontend (React + TypeScript)
- Modern UI with Tailwind CSS
- Context API for state management
- Real-time Socket.IO integration
- Responsive mobile design
- Router for navigation

### Database Schema
- **Users**: Phone, username, password, profile info
- **Messages**: Sender, recipient, content, timestamp
- **Friendships**: User relationships with status (pending/accepted)

## Security Notes

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Validate all inputs** both server and client
4. **Never commit .env files** to version control
5. **Use environment variables** for sensitive data

## Common Commands

```powershell
# Start server with auto-reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Clear node_modules
rm -r node_modules

# Check for errors
npm run dev
```

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Express.js Documentation](https://expressjs.com/)

## Support

For issues:
1. Check the troubleshooting section
2. Verify Node.js is installed correctly
3. Ensure ports 5000 and 5173 are available
4. Check console for error messages
5. Try restarting the servers

## Mobile Testing

To test on mobile devices on the same network:

1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```

2. On mobile device, go to: `http://<YOUR_IP>:5173`
   - Replace `<YOUR_IP>` with your computer's local IP

3. Make sure firewall allows port access

Enjoy using Vibegram! 🚀
