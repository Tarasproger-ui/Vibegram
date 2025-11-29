# Vibegram - Quick Reference Card

## 🚀 One-Line Start Commands

```powershell
# Windows - Automated Setup (Easiest!)
cd d:\Vibegram; .\setup.bat

# PowerShell - Launch everything
powershell -ExecutionPolicy Bypass -File start.ps1
```

## ⚡ Manual Commands

```powershell
# Install Dependencies
cd d:\Vibegram\server; npm install
cd d:\Vibegram\client; npm install

# Start Backend (Terminal 1)
cd d:\Vibegram\server; npm run dev

# Start Frontend (Terminal 2)
cd d:\Vibegram\client; npm run dev
```

## 🌐 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | Web app |
| Backend API | http://localhost:5000 | REST endpoints |
| Socket.IO | http://localhost:5000 | Real-time |
| Mobile | http://<YOUR_IP>:5173 | On mobile device |

## 📁 Key Directories

```
server/src/
├── index.ts              # Main server + Socket.IO
├── routes/               # API endpoints
├── models/               # Database
├── middleware/           # Auth
└── utils/                # Services

client/src/
├── main.tsx              # React entry
├── App.tsx               # Main component
├── pages/                # 5 page components
├── utils/                # API & Context
└── index.css             # Styles
```

## 🔧 Configuration

| File | Purpose |
|------|---------|
| `server/.env` | Backend config |
| `client/.env` | Frontend config |
| `server/package.json` | Backend deps |
| `client/package.json` | Frontend deps |

## 📝 Environment Variables

### Server (.env)
```
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
DATABASE_PATH=./vibegram.db
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📚 Documentation

| File | Read For |
|------|----------|
| README.md | Overview |
| SETUP.md | Installation |
| ARCHITECTURE.md | How it works |
| FEATURES.md | Testing |
| INDEX.md | Navigation |
| COMPLETION_SUMMARY.md | Project status |

## 🧪 Test Workflow

1. ✅ Register 2 accounts
2. ✅ Search and add friend
3. ✅ Accept friend request
4. ✅ Send message
5. ✅ Check typing indicator
6. ✅ Refresh and verify persistence

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| npm not found | Install Node.js from nodejs.org |
| Port in use | Kill process: `Get-Process -Id (netstat -ano \| Select-String "5000").Split() \| Stop-Process` |
| Database error | Delete `.db` file and restart |
| Install fails | `npm cache clean --force && npm install` |

## 📊 API Quick Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Friends
```
POST   /api/friends/request/:id
POST   /api/friends/accept/:id
GET    /api/friends/list
DELETE /api/friends/:id
```

### Messages
```
GET    /api/messages/conversation/:id
GET    /api/messages/recent
```

## 🔌 Socket.IO Events

### Emit (Client to Server)
```
socket.emit('authenticate', token)
socket.emit('send_message', {recipientId, content})
socket.emit('typing', {recipientId, isTyping})
```

### Listen (Server to Client)
```
socket.on('authenticated', data)
socket.on('receive_message', message)
socket.on('user_typing', {userId, isTyping})
socket.on('user_offline', {userId})
```

## 🛠️ Development Commands

```powershell
# Start development
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Clear cache
npm cache clean --force

# Update dependencies
npm update
```

## 📱 Mobile Testing

```powershell
# Find your IP
ipconfig

# On mobile browser
http://<YOUR_IP>:5173
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET before deployment
- [ ] Use HTTPS in production
- [ ] Update environment variables
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Enable firewall rules
- [ ] Set up monitoring
- [ ] Regular backups

## 🎨 UI Components

| Page | File | Purpose |
|------|------|---------|
| Login | pages/Login.tsx | Phone login |
| Register | pages/Register.tsx | Create account |
| ChatList | pages/ChatList.tsx | Conversations |
| Chat | pages/Chat.tsx | Messaging |
| Friends | pages/Friends.tsx | Friend management |

## 🚀 Production Checklist

- [ ] Install Node.js on server
- [ ] Clone/copy repository
- [ ] Install dependencies
- [ ] Set production environment
- [ ] Create database
- [ ] Set up SSL/HTTPS
- [ ] Configure domain DNS
- [ ] Start services
- [ ] Enable monitoring
- [ ] Backup configuration

## 📈 Performance Tips

- Limit message history load
- Archive old messages
- Monitor socket connections
- Use connection pooling
- Enable caching headers
- Compress responses
- Use CDN for assets

## 💾 Database Backup

```powershell
# Backup database
copy server\vibegram.db server\vibegram.db.backup

# Restore database
copy server\vibegram.db.backup server\vibegram.db
```

## 🧹 Clean Up

```powershell
# Remove node_modules
rm -r server\node_modules client\node_modules

# Remove dist
rm -r server\dist client\dist

# Reinstall
npm install
```

## 📞 Help Commands

```powershell
# Check Node version
node --version

# Check npm version
npm --version

# List npm packages
npm list

# Update npm
npm install -g npm@latest
```

## 🎯 Next Steps

1. **Today**: Install and run
2. **Tomorrow**: Test features
3. **This week**: Customize styling
4. **Next week**: Deploy to server

## 📦 What's Included

- ✅ Full-stack app
- ✅ 15+ API endpoints
- ✅ Real-time messaging
- ✅ Friend system
- ✅ Authentication
- ✅ Mobile responsive
- ✅ 7 docs
- ✅ Setup scripts

## 🎓 Learning Path

1. Run `SETUP.md`
2. Read `README.md`
3. Check `ARCHITECTURE.md`
4. Review code
5. Extend features

## 🚀 Go Live Checklist

- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Database created
- [ ] Server running
- [ ] Client running
- [ ] Browser opens
- [ ] Account created
- [ ] Friends added
- [ ] Messages sent

## 🎉 You're All Set!

Everything is ready. Just follow `SETUP.md` to get started.

**Happy coding! 🚀**

---

**Print this card for quick reference!**
