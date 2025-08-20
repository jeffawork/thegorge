# The Gorge - React Frontend

A modern, responsive React frontend for The Gorge blockchain infrastructure monitoring tool. Built with TypeScript, Tailwind CSS, and Framer Motion for smooth animations and excellent user experience.

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Beautiful UI/UX** with glassmorphism design and smooth animations
- **Real-time Updates** via WebSocket connections
- **Responsive Design** that works on all devices
- **Dark Theme** with gradient backgrounds and floating animations
- **Interactive Components** with hover effects and micro-interactions
- **Context-based State Management** for clean data flow
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations and transitions

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **Lucide React** - Beautiful icon library
- **Socket.io Client** - Real-time WebSocket communication

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx      # Main header with navigation
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── StatusOverview.tsx # System status cards
│   │   ├── RPCList.tsx     # RPC endpoints list
│   │   ├── RPCCard.tsx     # Individual RPC card
│   │   ├── AlertsList.tsx  # System alerts list
│   │   ├── AlertItem.tsx   # Individual alert item
│   │   ├── AddRPCModal.tsx # Add RPC modal form
│   │   ├── EmptyState.tsx  # Empty state component
│   │   └── ConnectionStatus.tsx # Connection indicator
│   ├── contexts/            # React context providers
│   │   ├── ConnectionContext.tsx # WebSocket connection
│   │   ├── RPCContext.tsx  # RPC endpoints management
│   │   └── AlertContext.tsx # System alerts management
│   ├── pages/               # Page components
│   │   └── Dashboard.tsx   # Main dashboard page
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles and Tailwind
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running (see main project README)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue gradients (`#3b82f6` to `#1d4ed8`)
- **Secondary**: Purple gradients (`#d946ef` to `#a21caf`)
- **Success**: Green (`#22c55e`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

### Components

- **Glass Cards**: Semi-transparent cards with backdrop blur
- **Gradient Buttons**: Beautiful gradient buttons with hover effects
- **Status Indicators**: Color-coded status dots and badges
- **Floating Shapes**: Animated background elements
- **Smooth Transitions**: All interactions use smooth animations

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900
- **Responsive**: Scales appropriately on all devices

## 🔧 Configuration

### Vite Configuration

The frontend is configured to proxy API requests to the backend server:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend server
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
```

### Tailwind Configuration

Custom colors, animations, and utilities are defined in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Custom primary colors */ },
        secondary: { /* Custom secondary colors */ },
        // ... more custom colors
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        // ... more custom animations
      },
    },
  },
}
```

## 📱 Responsive Design

The frontend is fully responsive with breakpoints:

- **Mobile**: `< 768px` - Single column layout
- **Tablet**: `768px - 1024px` - Two column layout
- **Desktop**: `> 1024px` - Three column layout

## 🎭 Animations

### Entrance Animations

- **Fade In**: Components fade in with staggered delays
- **Slide Up**: Content slides up from bottom
- **Scale In**: Modal dialogs scale in smoothly

### Interactive Animations

- **Hover Effects**: Cards lift and scale on hover
- **Button States**: Buttons have press and hover animations
- **Loading States**: Spinners and progress indicators

### Background Animations

- **Floating Shapes**: Subtle floating background elements
- **Gradient Shifts**: Animated gradient backgrounds
- **Parallax Effects**: Scroll-based animations

## 🔌 API Integration

### WebSocket Events

- `connect` - Connection established
- `disconnect` - Connection lost
- `rpcStatusUpdate` - RPC status changes
- `newAlert` - New system alert
- `alertResolved` - Alert resolved

### REST API Endpoints

- `GET /api/users/:userId/rpcs` - Get user's RPC endpoints
- `POST /api/users/:userId/rpcs` - Add new RPC endpoint
- `PATCH /api/users/:userId/rpcs/:id` - Update RPC endpoint
- `DELETE /api/users/:userId/rpcs/:id` - Delete RPC endpoint
- `POST /api/users/:userId/rpcs/:id/test` - Test RPC connection

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks

### State Management

- **React Context**: For global state (connection, RPCs, alerts)
- **Local State**: For component-specific state
- **Custom Hooks**: For reusable logic

## 🚀 Deployment

### Build Output

The build process creates optimized static files:

```bash
npm run build
```

Output directory: `dist/`

### Deployment Options

1. **Static Hosting**: Deploy `dist/` to Netlify, Vercel, or similar
2. **CDN**: Serve static files from a CDN
3. **Docker**: Containerize the frontend application

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the main project documentation
- Open an issue on GitHub
- Review the component documentation in the code

## 🔮 Future Enhancements

- **Theme Switching**: Light/dark mode toggle
- **Advanced Filtering**: Search and filter RPCs and alerts
- **Charts and Graphs**: Data visualization components
- **Mobile App**: React Native version
- **PWA**: Progressive web app features
- **Internationalization**: Multi-language support
