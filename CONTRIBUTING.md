# Contributing to LyricalGenius

First off, thank you for considering contributing to LyricalGenius! It's people like you that make this tool better for independent artists everywhere.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Detailed steps to reproduce the problem
- Expected behavior vs. actual behavior
- Screenshots or recordings if applicable
- Your browser and OS version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Why this enhancement would be useful to users
- Any implementation ideas you have

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style
4. Update documentation if needed
5. Write a clear commit message

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lyricalgenius.git
cd lyricalgenius

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Prefer interfaces over types for objects
- Use descriptive variable names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript props typing
- Avoid inline styles, use Tailwind classes

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Reference issues and pull requests when relevant

## Project Structure

- `src/components/` - Reusable React components
- `src/pages/` - Page-level components
- `src/stores/` - Zustand state management
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

## Privacy First

Remember: This project is built on the principle of **privacy first**. Any contribution that:
- Sends user data to external servers
- Requires user authentication
- Tracks user behavior

...will not be accepted unless there's a compelling reason and explicit user consent.

## Questions?

Feel free to open an issue with the `question` label or start a discussion in GitHub Discussions.

Thank you for contributing! 🎵
