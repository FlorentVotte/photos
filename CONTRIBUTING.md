# Contributing to Photobook

Thank you for your interest in contributing to Photobook!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/photobook.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Initialize database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Run `npm run lint` before committing

## Pull Requests

1. Keep changes focused and atomic
2. Update documentation if needed
3. Test your changes locally
4. Write clear commit messages
5. Reference any related issues

## Reporting Issues

When reporting bugs, please include:

- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots if applicable

## Questions

Feel free to open an issue for questions or discussions.
