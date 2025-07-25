# 🤝 Contributing to AI-Powered Virtual Chemistry Lab

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🚀 Quick Start for Contributors

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/myche-lab.git
   cd myche-lab
   ```

2. **Set Up Development Environment**
   ```bash
   # Run the setup script
   ./setup.ps1
   
   # Or manually:
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 🧪 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes for backend functionality
│   ├── dashboard/      # User dashboard
│   ├── play/           # Play mode lab interface
│   ├── practical/      # Practical mode lab interface
│   └── (auth)/         # Authentication pages
├── components/
│   └── lab/            # Reusable lab equipment components
├── lib/                # Utility functions and integrations
│   ├── gemini.ts       # Google Gemini AI integration
│   └── mongodb.ts      # Database connection
└── models/             # MongoDB schemas
```

## 🎯 Areas for Contribution

### 🧬 New Chemical Elements
- Add more elements to the periodic table
- Improve element properties and safety data
- Add element visualization improvements

### ⚗️ Chemical Reactions
- Implement more complex reaction predictions
- Add reaction animation effects
- Improve safety warning systems

### 🎨 UI/UX Improvements
- Enhance lab equipment animations
- Improve mobile responsiveness
- Add accessibility features

### 🤖 AI Enhancements
- Improve reaction prediction accuracy
- Add experimental procedure suggestions
- Implement natural language processing for queries

### 📊 Features
- Add experiment history tracking
- Implement user achievement system
- Create educational tutorials

## 🛠 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Next.js best practices
- Use TailwindCSS for styling
- Add proper error handling

### Component Guidelines
```typescript
// Example component structure
interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
}
```

### API Route Guidelines
```typescript
// Example API route
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // API logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

## 🧪 Testing Your Changes

### Manual Testing
1. Test in both Play and Practical modes
2. Verify authentication flows work
3. Check mobile responsiveness
4. Test with different browsers

### Code Quality
```bash
# Lint your code
npm run lint

# Build to check for errors
npm run build
```

## 📝 Submitting Changes

### Commit Guidelines
- Use clear, descriptive commit messages
- Follow conventional commits format
```bash
feat: add new chemical element Uranium
fix: resolve drag-and-drop issue in Safari
docs: update API documentation
style: improve button hover animations
```

### Pull Request Process
1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Test your changes thoroughly
   - Update documentation if needed

3. **Submit Pull Request**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Style/UI improvement

## Testing
- [ ] Tested in development environment
- [ ] Tested on mobile devices
- [ ] Verified authentication still works

## Screenshots
(If applicable)
```

## 🎓 Learning Resources

### Technologies Used
- **Next.js 15**: [Documentation](https://nextjs.org/docs)
- **React 18**: [Documentation](https://react.dev/)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **TailwindCSS**: [Documentation](https://tailwindcss.com/docs)
- **Clerk**: [Documentation](https://clerk.dev/docs)
- **MongoDB**: [Documentation](https://docs.mongodb.com/)

### Chemistry Resources
- **Periodic Table**: [NIST](https://www.nist.gov/pml/periodic-table-elements)
- **Chemical Safety**: [OSHA](https://www.osha.gov/chemical-hazards)
- **Reaction Database**: [ChemSpider](http://www.chemspider.com/)

## 🐛 Reporting Issues

### Bug Reports
Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots

### Feature Requests
Include:
- Clear description of the feature
- Use case or motivation
- Proposed implementation (if any)
- Examples or mockups

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Project documentation
- Release notes for significant contributions

## 📞 Getting Help

- **Discord**: Join our community for real-time help
- **GitHub Issues**: For bugs and feature requests
- **Email**: For private inquiries

## 🏆 Contributor Benefits

- Learn modern web development technologies
- Gain experience with AI integration
- Build portfolio projects
- Network with other developers
- Contribute to educational technology

---

**Thank you for helping make chemistry education more interactive and accessible! 🧪💫**
