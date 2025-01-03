# Contributing to Leaflet.IndependoMaps

Thank you for your interest in contributing to `Leaflet.IndependoMaps`! We value contributions of all kinds, including
bug fixes, feature additions, documentation improvements, and more. This document provides guidelines to help you get
started and ensure a smooth collaboration.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

1. **Fork the Repository**
   Start by forking the repository to your GitHub account.

2. **Clone Your Fork**
   Clone the forked repository to your local machine:
   ```bash
   git clone https://github.com/<your-username>/leaflet-independo-maps.git
   cd leaflet-independo-maps
   ```

3. **Install Dependencies**
   Install the necessary dependencies using `npm`:
   ```bash
   npm install
   ```

4. **Run `rollup` in Watch Mode**
   Start the development server and watch for changes:
   ```bash
   npm run watch
   ```

5. **Start a Local Server**
   Use the provided `index.html` or create your own test cases:
   ```bash
   npx http-server
   ```

---

## Development Workflow

1. **Create a Branch**
   Use a descriptive branch name for your feature or fix:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Implement Changes**
   Write clean, maintainable, and well-documented code. Follow the [Coding Standards](#coding-standards) and ensure your
   changes work as expected.

3. **Test Your Changes**
   Ensure your changes work as expected and do not break existing functionality. Use the example HTML file or write new
   tests for your changes.

4. **Commit Your Changes**
   Follow the [Conventional Commits](#commit-messages) format for your commit messages.

5. **Push Your Branch**
   Push your changes to your fork:
   ```bash
   git push origin feature/my-awesome-feature
   ```

6. **Submit a Pull Request**
   Open a pull request on the main repository. Provide a detailed description of your changes and any additional
   context.

---

## Coding Standards

- **Use TypeScript**: All code should be written in TypeScript for type safety and maintainability.
- **Naming Conventions**: Use descriptive names for variables, functions, and classes.
- **TypeScript Style Guide**: Google provides some
  nice [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) recommendations.
- **Formatting**: Make sure your editor reads the `.editorconfig` file for consistent formatting.
- **Documentation**: Add comments to explain complex logic or decisions.

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.
This ensures a consistent history and improves changelog generation.

### **Commit Format**

```
<type>(<scope>): <description>
```

### **Types**

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation updates
- **style**: Code style changes (e.g., formatting)
- **refactor**: Code refactoring without affecting functionality
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (e.g., dependency updates)

### **Examples**

- `feat(plugin): add dynamic POI loading based on bounds`
- `fix(layer): resolve issue with marker duplication on moveend event`
- `docs(readme): update usage instructions`

Use meaningful descriptions to make the purpose of the change clear. We also generate release notes from these commit
messages, so be descriptive.

---

## Pull Request Guidelines

1. **Write a Clear Description**
   Provide context for your changes, link to relevant issues, and describe the expected behavior.

2. **Ensure Passing CI**
   Make sure all tests and checks pass before submitting your pull request.

3. **Keep It Small**
   Focus each pull request on a single feature, fix, or improvement. Submit separate pull requests for unrelated
   changes.

4. **Request Reviews**
   Tag reviewers or maintainers who can provide feedback.

---

## Reporting Issues

If you encounter any bugs, have feature requests, or need clarification, please open an issue on GitHub:
[Issues Page](https://github.com/independo-gmbh/leaflet-independo-maps/issues)

### When Reporting an Issue

- Include a detailed description of the problem.
- Provide steps to reproduce the issue.
- Share relevant logs, screenshots, or code snippets.

---

## Code of Conduct

By contributing to this project, you agree to abide by
the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Be respectful, inclusive, and
professional in all interactions.

---

Thank you for your contributions! Together, we can make `Leaflet.IndependoMaps` a fantastic tool for mapping points of
interest as pictograms to make the digital world a bit more accessible for everyone.
