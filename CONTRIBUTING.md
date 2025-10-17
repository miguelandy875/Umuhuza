# Contributing to Umuhuza

Thank you for contributing to Umuhuza! 🚀

---

## 📋 Example Pull Request Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally

## Screenshots (if applicable)
Add screenshots here
```

---

**Happy Contributing! 🎉** your interest in contributing to Umuhuza! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/umuhuza-backend.git
   cd umuhuza-backend
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/umuhuza-backend.git
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues. When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **System information** (OS, Python version, Django version)
- **Error logs** or stack traces

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Use case** - why is this enhancement needed?
- **Proposed solution** if you have one
- **Alternative solutions** you've considered

### Pull Requests

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow PEP 8 style guide
   - Add docstrings to functions and classes
   - Add comments for complex logic

3. **Test your changes**
   ```bash
   python manage.py test
   python test_api.py
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit Message Format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

## 💻 Development Guidelines

### Code Style

- Follow **PEP 8** for Python code
- Use **4 spaces** for indentation (no tabs)
- Maximum line length: **100 characters**
- Use **meaningful variable names**
- Add **type hints** where applicable

**Example:**

```python
def create_notification(
    user: User,
    title: str,
    message: str,
    notif_type: str,
    link_url: Optional[str] = None
) -> Notification:
    """
    Create a notification for a user.
    
    Args:
        user: The user to notify
        title: Notification title
        message: Notification message
        notif_type: Type of notification
        link_url: Optional URL to link to
        
    Returns:
        Notification: The created notification object
    """
    return Notification.objects.create(
        userid=user,
        notif_title=title,
        notif_message=message,
        notif_type=notif_type,
        link_url=link_url
    )
```

### Database Migrations

- Always create migrations after model changes
- Test migrations both up and down
- Never edit migration files manually
- Include migration files in commits

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py migrate app_name zero  # Test rollback
```

### API Design

- Follow RESTful conventions
- Use appropriate HTTP methods
- Return meaningful status codes
- Include error messages in responses
- Document new endpoints in README

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for >80% code coverage

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Documentation

- Update README.md for new features
- Add docstrings to all functions/classes
- Update API documentation
- Include code examples where helpful

## 🏗️ Project Structure Rules

- **One feature per app** - keep apps focused
- **Models in models.py** - don't split unless very large
- **Business logic in views** or separate services
- **Reusable code in utils.py**
- **Constants in constants.py** or settings

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description explains changes clearly

## 🔍 Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Feedback** addressed by contributor
4. **Approval** and merge

## 🎯 Priority Areas

We especially welcome contributions in:

- **Performance optimization**
- **Security improvements**
- **Test coverage**
- **Documentation**
- **Bug fixes**
- **Accessibility improvements**

## 📚 Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django Rest Framework](https://www.django-rest-framework.org/)
- [PEP 8 Style Guide](https://pep8.org/)
- [Git Workflow](https://guides.github.com/introduction/flow/)

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions
- **Email** - support@umuhuza.com for sensitive issues

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

Thank you