# Copilot Instructions for AI-Powered Virtual Chemistry Lab

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack virtual chemistry lab application built with:
- **Frontend**: Next.js 15 with TypeScript, TailwindCSS, React DnD for drag-and-drop functionality
- **Authentication**: Clerk for secure user authentication with email/password and Google login
- **AI Integration**: Google Gemini API for predicting chemical reactions and outcomes
- **Database**: MongoDB for storing elements, compounds, and user experiment history
- **Styling**: TailwindCSS with custom animations for realistic lab equipment interactions

## Key Features
1. **Dual Mode System**: Play Mode (casual exploration) and Practical Mode (realistic experiments)
2. **Interactive Lab Interface**: Drag-and-drop beakers, test tubes, heating/cooling equipment
3. **AI-Powered Predictions**: Real-time chemical reaction predictions with color, state, formula, and safety warnings
4. **Parameter Controls**: Weight, temperature, pressure, volume inputs for accurate simulations
5. **Visual Reactions**: Animated liquid color changes and state transitions

## Development Guidelines
- Use TypeScript for all components and maintain strict type safety
- Implement responsive design with TailwindCSS utility classes
- Create reusable components for lab equipment (beakers, test tubes, burners, etc.)
- Use React Context for global state management (user auth, experiment data, lab equipment state)
- Implement smooth animations using Framer Motion for realistic lab equipment interactions
- Follow React best practices with proper error boundaries and loading states
- Use Next.js App Router for routing and API routes for backend functionality
- Implement proper error handling for AI API calls and database operations

## Code Style
- Use functional components with hooks
- Implement proper TypeScript interfaces for all props and state
- Use descriptive variable and function names related to chemistry terminology
- Add JSDoc comments for complex chemistry-related functions
- Maintain consistent file structure with clear separation of concerns

## Security Considerations
- Store API keys securely using environment variables
- Implement proper input validation for chemical parameters
- Add safety warnings for potentially dangerous chemical combinations
- Use Clerk's security features for user authentication and session management

## Testing
- Write unit tests for chemical calculation functions
- Test drag-and-drop interactions thoroughly
- Verify AI response handling and error cases
- Test responsive design across different devices
