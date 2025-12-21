# Contributing to Lockd

First off, thank you for considering contributing to Lockd! It's people like you that make Lockd such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful in your communication
- Be constructive and helpful

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots or recordings** if possible
- **Include your environment details** (OS, browser, wallet, chain)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **List any alternative solutions** you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies** with `npm install`
3. **Make your changes** following our coding style
4. **Add tests** if applicable
5. **Ensure all tests pass** with `npm test`
6. **Update documentation** if needed
7. **Submit your pull request**

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lockd.git
cd lockd

# Install dependencies
npm install

# Run the web app
npm run dev

# Run contract tests
npm run test:contracts
```

### Project Structure

```
lockd/
├── apps/
│   └── web/              # Next.js web application
│       ├── src/
│       │   ├── app/      # Next.js app router pages
│       │   ├── components/ # React components
│       │   └── lib/      # Utilities and contracts
├── packages/
│   └── contracts/        # Solidity smart contracts
│       ├── contracts/    # Contract source files
│       ├── test/         # Contract tests
│       └── scripts/      # Deployment scripts
```

### Coding Style

#### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow the existing code style (Prettier is configured)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

#### Solidity

- Follow Solidity style guide
- Use NatSpec comments for documentation
- Optimize for gas efficiency
- Include comprehensive tests

### Testing

#### Smart Contracts

```bash
cd packages/contracts
npm test
```

#### Web Application

```bash
cd apps/web
npm run lint
```

### Commit Messages

Use clear and meaningful commit messages:

- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update README`
- `refactor: improve code structure`
- `test: add tests for X`
- `chore: update dependencies`

## Smart Contract Changes

If you're making changes to the smart contracts:

1. **Security is paramount** - All changes must maintain or improve security
2. **Gas efficiency matters** - Optimize for lower gas costs
3. **Backward compatibility** - Consider upgrade paths
4. **Comprehensive testing** - Add tests for all new functionality
5. **Documentation** - Update NatSpec comments

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing.

## Recognition

Contributors will be recognized in our README and on the project website. Thank you for your contributions!

