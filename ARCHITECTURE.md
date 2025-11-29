# Vibegram - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                              │
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐                │
│  │  Desktop Browser │        │  Mobile Browser  │                │
│  │  (http://...)    │        │  (http://...)    │                │
│  └────────┬─────────┘        └────────┬─────────┘                │
│           │                           │                           │
│           └───────────────┬───────────┘                           │
│                           │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                    NETWORK (HTTP/WS)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│    REACT FRONTEND       │         │   NODE.JS BACKEND       │
│   (http://5173)         │         │   (http://5000)         │
│                         │         │                         │
│ ┌─────────────────────┐ │         │ ┌─────────────────────┐ │
│ │  React Components   │ │         │ │  Express Server     │ │
│ │  ├─ Login Page      │ │         │ │  ├─ Auth Routes    │ │
│ │  ├─ Register Page   │ │         │ │  ├─ Friends Routes │ │
│ │  ├─ Chat Page       │ │         │ │  └─ Message Routes │ │
│ │  ├─ ChatList Page   │ │         │ │                     │ │
│ │  └─ Friends Page    │ │         │ │ ┌─────────────────┐ │ │
│ └─────────────────────┘ │         │ │ │   Socket.IO     │ │ │
│                         │         │ │ │ Real-time Events│ │ │
│ ┌─────────────────────┐ │         │ │ └─────────────────┘ │ │
│ │ Context API         │ │         │ └─────────────────────┘ │
│ │ ├─ AuthContext      │ │         │                         │
│ │ └─ SocketContext    │ │         │ ┌─────────────────────┐ │
│ └─────────────────────┘ │         │ │  Services Layer     │ │
│                         │         │ │  ├─ userService     │ │
│ ┌─────────────────────┐ │         │ │  ├─ friendService   │ │
│ │ Tailwind CSS        │ │         │ │  └─ messageService  │ │
│ │ Responsive Design   │ │         │ │                     │ │
│ └─────────────────────┘ │         │ └─────────────────────┘ │
│                         │         │                         │
│ ┌─────────────────────┐ │         │ ┌─────────────────────┐ │
│ │ Socket.IO Client    │◄─┼────────┤►│ Socket.IO Server    │ │
│ └─────────────────────┘ │         │ └─────────────────────┘ │
│                         │         │                         │
└─────────────────────────┘         │ ┌─────────────────────┐ │
                                    │ │ JWT Authentication  │ │
                                    │ │ Password Hashing    │ │
                                    │ └─────────────────────┘ │
                                    │                         │
                                    └─────────────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────────────┐
                                    │   SQLite Database       │
                                    │                         │
                                    │ ┌───────────────────┐   │
                                    │ │  Users Table      │   │
                                    │ │  ├─ id            │   │
                                    │ │  ├─ phone         │   │
                                    │ │  ├─ username      │   │
                                    │ │  ├─ password      │   │
                                    │ │  └─ avatar        │   │
                                    │ └───────────────────┘   │
                                    │                         │
                                    │ ┌───────────────────┐   │
                                    │ │  Messages Table   │   │
                                    │ │  ├─ id            │   │
                                    │ │  ├─ senderId      │   │
                                    │ │  ├─ recipientId   │   │
                                    │ │  ├─ content       │   │
                                    │ │  └─ createdAt     │   │
                                    │ └───────────────────┘   │
                                    │                         │
                                    │ ┌───────────────────┐   │
                                    │ │  Friendships Tbl  │   │
                                    │ │  ├─ id            │   │
                                    │ │  ├─ userId        │   │
                                    │ │  ├─ friendId      │   │
                                    │ │  ├─ status        │   │
                                    │ │  └─ createdAt     │   │
                                    │ └───────────────────┘   │
                                    │                         │
                                    └─────────────────────────┘
```

## Data Flow Diagrams

### User Registration Flow
```
User Input (Phone, Username, Password)
         │
         ▼
    Form Validation
         │
         ▼
    API POST /register
         │
         ▼
    Backend Validation
         │
         ├─► Check for duplicates
         │
         ├─► Hash password
         │
         ├─► Generate JWT token
         │
         ▼
    Save to Database
         │
         ▼
    Return token to client
         │
         ▼
    Store token (localStorage)
         │
         ▼
    Redirect to Chat
```

### Message Send Flow
```
User Types & Sends Message
         │
         ▼
    Client-side Validation
         │
         ▼
    Emit Socket Event
    (send_message)
         │
         ▼
    Server Receives Event
         │
         ├─► Verify authentication
         │
         ├─► Check friend relationship
         │
         ├─► Validate message content
         │
         ▼
    Save to Database
         │
         ▼
    Emit to Recipient
    (if online)
         │
         ▼
    Display in UI
         │
         ▼
    Update Conversation
```

### Friend Request Flow
```
User Searches & Adds Friend
         │
         ▼
    Search API
    GET /search?q=username
         │
         ▼
    Returns user list
         │
         ▼
    User Clicks "Add Friend"
         │
         ▼
    API POST /friends/request/:id
         │
         ▼
    Backend Checks
    ├─► User not already friend
    ├─► Request not already sent
         │
         ▼
    Save Request to DB
    (status: pending)
         │
         ▼
    Recipient Sees Request
         │
         ▼
    Recipient Accepts/Rejects
         │
         ▼
    Update Friendship Status
    (accepted/removed)
         │
         ▼
    Add to Friends List
```

### Authentication Flow
```
Login Page
    │
    ▼
Enter Phone & Password
    │
    ▼
Validate Input
    │
    ▼
POST /api/auth/login
    │
    ▼
Backend Verification
├─► Find user by phone
├─► Compare password hash
├─► Generate JWT token
    │
    ▼
Return Token
    │
    ▼
Store in localStorage
    │
    ▼
Set Authorization Header
    │
    ▼
Connect Socket.IO
with token
    │
    ▼
Authenticated ✓
    │
    ▼
Redirect to /chat
```

## Component Hierarchy

```
App
├── ProtectedRoute
│   ├── ChatList
│   │   ├── Header
│   │   ├── UserInfo
│   │   └── ConversationList
│   │
│   ├── Chat
│   │   ├── ChatHeader
│   │   ├── MessageList
│   │   │   └── Message (multiple)
│   │   └── MessageInput
│   │
│   └── Friends
│       ├── Header
│       ├── SearchBox
│       ├── SearchResults
│       ├── PendingRequests
│       └── FriendsList
│
├── Login
│   ├── LoginForm
│   └── RegisterLink
│
└── Register
    ├── RegisterForm
    └── LoginLink
```

## State Management

### AuthContext
```
State:
├─ user: {
│  ├─ userId: string
│  ├─ phone: string
│  ├─ username: string
│  ├─ displayName: string
│  ├─ avatar: string
│  └─ token: string
│  }
├─ loading: boolean

Methods:
├─ register(phone, username, password)
├─ login(phone, password)
├─ logout()
└─ updateProfile(displayName, avatar)
```

### SocketContext
```
State:
├─ socket: Socket | null
├─ isConnected: boolean

Events:
├─ authenticate
├─ send_message
├─ receive_message
├─ typing
└─ user_typing
```

## API Call Flow

```
React Component
    │
    ▼
useAuth() / useSocket()
    │
    ▼
Trigger Action
(login, register, sendMessage)
    │
    ▼
API Client
├─ Axios for HTTP
└─ Socket.IO for WebSocket
    │
    ▼
Backend Server
    │
    ├─► Middleware (Auth validation)
    │
    ├─► Route Handler
    │
    ├─► Service Layer
    │
    ├─► Database
    │
    ▼
Response
    │
    ├─► Success: Update state
    └─► Error: Show error message
```

## Database Relationships

```
Users
├─ 1 (user) ─── M (messages as sender)
├─ 1 (user) ─── M (messages as recipient)
└─ 1 (user) ─── M (friendships)

Messages
├─ M ─── 1 (sender User)
└─ M ─── 1 (recipient User)

Friendships
├─ M ─── 1 (User1)
└─ M ─── 1 (User2)
```

## Real-Time Communication Flow

```
Client 1                    Server                    Client 2
│                              │                           │
├─ authenticate ──────────────►│                           │
├◄─ authenticated ─────────────┤                           │
│                              │                           │
├─ send_message ──────────────►│                           │
│                              ├─ validate & save         │
│                              ├─ find recipient          │
│                              ├─ emit receive_message ──►├
│                              │                           │
│                              ◄─ receive_message ────────┤
│                              │                           │
├─ typing ────────────────────►│                           │
│                              ├─ emit user_typing ──────►├
│                              │                           │
│                              ◄─ user_typing ────────────┤
│                              │                           │
│◄─ disconnect ────────────────┤─► emit user_offline ────►├
│                              │                           │
```

---

**Architecture designed for:** 
- ✅ Scalability
- ✅ Real-time performance
- ✅ Security
- ✅ Maintainability
- ✅ Extensibility

**Last Updated:** November 27, 2025
