# 🧪 AI-Powered Virtual Chemistry Lab

A full-stack web application that provides an immersive virtual chemistry laboratory experience powered by AI predictions and interactive simulations.

## ✨ Features

### 🎮 Dual Mode System
- **Play Mode**: Casual exploration with drag-and-drop elements
- **Practical Mode**: Realistic experiments with precise lab parameters

### 🤖 AI Integration
- **Google Gemini API** for chemical reaction predictions
- Real-time compound name, formula, and safety warnings
- Color and state of matter predictions

### 🔐 Authentication
- **Clerk Authentication** with email/password and Google login
- User profiles and experiment history
- Secure session management

### 🧬 Interactive Lab Interface
- Drag-and-drop virtual lab equipment
- Animated beakers, test tubes, and equipment
- Real-time visual reactions and color changes
- Parameter controls (temperature, pressure, volume, weight)

### 💾 Data Persistence
- **MongoDB** for storing elements, compounds, and experiments
- User experiment history and preferences
- Achievement tracking and statistics

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript |
| **Styling** | TailwindCSS, Framer Motion |
| **Authentication** | Clerk |
| **AI/ML** | Google Gemini Pro API |
| **Database** | MongoDB with Mongoose |
| **Interactions** | React DnD (HTML5 Backend) |
| **Icons** | Lucide React |
| **Deployment** | Ready for Vercel/Netlify |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Clerk account
- Google Gemini API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd myche-lab
npm install
```

### 2. Environment Setup

Create `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB
MONGODB_URI=your_mongodb_uri_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. API Keys Setup

#### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Create a new application
3. Copy the publishable key and secret key
4. Configure social login providers (Google recommended)

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy the API key to your environment variables

#### MongoDB Setup
1. Create a MongoDB cluster (Atlas recommended)
2. Get the connection string
3. Add it to your environment variables

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
myche-lab/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── play/          # Play mode lab
│   │   ├── practical/     # Practical mode lab
│   │   ├── sign-in/       # Authentication pages
│   │   └── sign-up/
│   ├── components/
│   │   └── lab/           # Lab equipment components
│   ├── lib/
│   │   ├── gemini.ts      # AI integration
│   │   └── mongodb.ts     # Database connection
│   └── models/            # Database schemas
├── .env.local             # Environment variables
└── README.md
```

## 🎯 Core User Flow

1. **Authentication**: Users sign in via Clerk (email/password or Google)
2. **Mode Selection**: Choose between Play Mode or Practical Mode
3. **Virtual Experimentation**: 
   - Drag elements into beakers
   - Set lab parameters (in Practical Mode)
   - Get AI-powered reaction predictions
4. **Results**: View compound information, safety warnings, and explanations
5. **History**: Save and review past experiments

## 🧪 Example AI Prompts

### Play Mode
```
Combine Sodium + Chlorine at normal lab conditions. 
Predict the resulting compound's name, chemical formula, color, and state of matter.
```

### Practical Mode
```
Mix 5g Hydrogen + 10g Oxygen at 2 atm pressure, heated to 200°C. 
Predict the reaction outcome with final compound formula, color, and state.
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/elements` | GET | Get available elements |
| `/api/reactions/predict` | POST | Predict chemical reactions |
| `/api/experiments` | GET/POST | Manage user experiments |

## 🎨 Design Features

- **Glassmorphism UI** with backdrop blur effects
- **Smooth animations** with Framer Motion
- **Responsive design** for all devices
- **Accessible components** with proper ARIA labels
- **Safety color coding** for dangerous chemicals

## 🛡 Security Features

- Clerk authentication with session management
- Input validation for chemical parameters
- AI response sanitization
- Environment variable protection
- Safe chemical combination warnings

## 📊 Database Models

- **Elements**: Periodic table data with properties
- **Compounds**: Known chemical compounds
- **Experiments**: User experiment history
- **UserProfiles**: User preferences and achievements

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend
The API routes are serverless functions that deploy with the frontend.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for AI-powered predictions
- Clerk for authentication services
- React DnD for drag-and-drop functionality
- TailwindCSS for styling
- MongoDB for data persistence

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Happy Experimenting! 🧪🔬**
# Mychem-Lab
