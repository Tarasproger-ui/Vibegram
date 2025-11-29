# Vibegram Environment Configuration
# Copy this file to .env in both server and client directories

# ==========================================
# SERVER CONFIGURATION (.env in server/)
# ==========================================

# Server port
PORT=5000

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Environment mode
NODE_ENV=development

# Database path
DATABASE_PATH=./vibegram.db

# CORS Configuration
CORS_ORIGIN=*


# ==========================================
# CLIENT CONFIGURATION (.env in client/)
# ==========================================

# API endpoint
VITE_API_URL=http://localhost:5000

# Socket.IO endpoint
VITE_SOCKET_URL=http://localhost:5000


# ==========================================
# PRODUCTION CONFIGURATION
# ==========================================

# For production, change:
# 
# Server:
#   - JWT_SECRET to a secure random string
#   - NODE_ENV=production
#   - CORS_ORIGIN to your domain
#   - DATABASE_PATH to secure location
#
# Client:
#   - VITE_API_URL=https://your-domain.com
#   - VITE_SOCKET_URL=https://your-domain.com
#
# Example Production Setup:
#
# PORT=5000
# JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# NODE_ENV=production
# DATABASE_PATH=/var/lib/vibegram/db.sqlite
# CORS_ORIGIN=https://vibegram.example.com
#
# VITE_API_URL=https://api.vibegram.example.com
# VITE_SOCKET_URL=https://api.vibegram.example.com
