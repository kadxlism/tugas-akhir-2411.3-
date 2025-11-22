# Frontend Testing Documentation

## 🧪 Testing Infrastructure Overview

This document provides comprehensive information about the frontend testing infrastructure for the Role Management System.

## 📁 Test Structure

```
frontend/src/test/
├── components/           # Component tests
│   ├── RequireAdmin.test.tsx
│   ├── RequireAuth.test.tsx
│   ├── Layout.test.tsx
│   ├── Sidebar.test.tsx
│   └── dashboard/        # Dashboard component tests
│       ├── DashboardCards.test.tsx
│       └── StatisticsCharts.test.tsx
├── pages/               # Page tests
│   ├── Login.test.tsx
│   ├── Register.test.tsx
│   ├── Dashboard.test.tsx
│   ├── UserList.test.tsx
│   └── Unauthorized.test.tsx
├── integration/         # Integration tests
│   ├── AuthFlow.test.tsx
│   ├── RoleBasedNavigation.test.tsx
│   └── UserManagementFlow.test.tsx
├── hooks/               # Hook tests
│   └── useAuth.test.tsx
├── services/            # Service tests
│   └── api.test.ts
├── contexts/            # Context tests
│   └── AuthContext.test.tsx
├── utils/               # Test utilities
│   ├── test-utils.tsx
│   ├── testHelpers.ts
│   └── mockData.ts
└── mocks/               # Mock data and handlers
    ├── server.ts
    └── handlers.ts
```

## 🛠️ Testing Tools

### Core Testing Libraries
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing
- **MSW**: API mocking

### Additional Tools
- **@testing-library/jest-dom**: Custom matchers
- **@testing-library/user-event**: User interaction simulation
- **@vitest/coverage-v8**: Code coverage
- **@vitest/ui**: Test UI interface

## 🚀 Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Open Cypress UI
npm run test:e2e

# Run Cypress headlessly
npm run test:e2e:run
```

## 📋 Test Categories

### 1. Component Tests
Tests individual React components in isolation.

**Examples:**
- `RequireAdmin.test.tsx` - Tests admin role protection
- `Layout.test.tsx` - Tests layout component with role-based navigation
- `Sidebar.test.tsx` - Tests sidebar navigation and permissions

**Key Features:**
- Role-based rendering tests
- User interaction tests
- Props and state testing
- Error boundary testing

### 2. Page Tests
Tests complete page components and their functionality.

**Examples:**
- `Login.test.tsx` - Tests login form validation and submission
- `Register.test.tsx` - Tests registration form and validation
- `Dashboard.test.tsx` - Tests dashboard with different user roles
- `UserList.test.tsx` - Tests user management page

**Key Features:**
- Form validation testing
- API integration testing
- Error handling testing
- Loading state testing

### 3. Integration Tests
Tests the interaction between multiple components and services.

**Examples:**
- `AuthFlow.test.tsx` - Tests complete authentication flow
- `RoleBasedNavigation.test.tsx` - Tests navigation based on user roles
- `UserManagementFlow.test.tsx` - Tests user management workflow

**Key Features:**
- End-to-end user flows
- Role-based access control
- API integration
- State management

### 4. Hook Tests
Tests custom React hooks.

**Examples:**
- `useAuth.test.tsx` - Tests authentication hook

**Key Features:**
- State management testing
- Side effect testing
- Error handling testing

### 5. Service Tests
Tests API services and utilities.

**Examples:**
- `api.test.ts` - Tests API service configuration

**Key Features:**
- HTTP request testing
- Error handling testing
- Response processing testing

### 6. Context Tests
Tests React contexts and providers.

**Examples:**
- `AuthContext.test.tsx` - Tests authentication context

**Key Features:**
- Context value testing
- Provider functionality testing
- Consumer behavior testing

## 🎯 Testing Patterns

### 1. Role-Based Testing
Tests components and pages with different user roles.

```typescript
// Test admin access
testRoleAccess(component, 'admin', true)

// Test team member access
testRoleAccess(component, 'team', false)

// Test all roles
testAllRoles(component, true) // admin only
```

### 2. API Mocking
Uses MSW (Mock Service Worker) for API mocking.

```typescript
// Mock successful API response
mockApiSuccess('/api/users', mockUsers)

// Mock API error
mockApiError('/api/users', new Error('Network error'))

// Expect API call
expectApiCall('get', '/api/users')
```

### 3. Form Testing
Tests form validation and submission.

```typescript
// Fill form
fillForm({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
})

// Submit form
submitForm('Create User')

// Expect validation error
expectFormError('Name is required')
```

### 4. Navigation Testing
Tests routing and navigation.

```typescript
// Expect navigation
expectNavigation('/dashboard')

// Expect no navigation
expectNoNavigation()
```

## 🔧 Test Utilities

### Custom Render Function
Provides React context and routing for tests.

```typescript
// Render with authentication
renderWithAuth(component, mockUsers.admin)

// Render with specific role
renderWithRole(component, 'admin')

// Render with loading state
renderWithLoading(component)
```

### Mock Data
Comprehensive mock data for all user roles and entities.

```typescript
// Mock users
const adminUser = mockUsers.admin
const teamUser = mockUsers.team

// Mock projects
const mockProject = createMockProject({
  name: 'Test Project',
  status: 'active'
})

// Mock tasks
const mockTask = createMockTask({
  title: 'Test Task',
  status: 'todo'
})
```

### Test Helpers
Utility functions for common test scenarios.

```typescript
// Assertions
expectToBeInDocument('Welcome')
expectNotToBeInDocument('Error')
expectToHaveClass(element, 'active')

// API testing
expectApiCall('post', '/api/users')
expectApiCallWithData('post', '/api/users', userData)

// Form testing
fillForm(formData)
submitForm('Submit')
expectFormError('Validation error')
```

## 🎨 E2E Testing with Cypress

### Test Structure
```
cypress/
├── e2e/
│   ├── role-management.cy.ts
│   └── user-management.cy.ts
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── fixtures/
    └── users.json
```

### Custom Commands
```typescript
// Login as specific role
cy.loginAsAdmin()
cy.loginAsPM()
cy.loginAsTeam()
cy.loginAsClient()

// Visit with authentication
cy.visitWithAuth('/admin/users', 'admin')

// Logout
cy.logout()
```

### Test Scenarios
1. **Role Management Tests**
   - Admin access to all features
   - PM access to limited features
   - Team member access restrictions
   - Client access limitations

2. **User Management Tests**
   - User CRUD operations
   - Role-based access control
   - Form validation
   - Error handling

3. **Navigation Tests**
   - Route protection
   - Role-based navigation
   - Redirect behavior

## 📊 Coverage and Quality

### Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### Quality Metrics
- **Test Reliability**: All tests should be deterministic
- **Test Speed**: Unit tests < 100ms, Integration tests < 1s
- **Test Maintainability**: Clear, readable, and well-documented

## 🐛 Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async operations
2. **Mocking**: Ensure mocks are properly set up
3. **Context**: Use proper test wrappers
4. **Cleanup**: Clean up after each test

### Debugging Tools
```typescript
// Debug component state
screen.debug()

// Debug specific element
screen.debug(screen.getByText('Submit'))

// Log API calls
console.log(mockAxios.get.mock.calls)
```

## 📝 Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Reset mocks between tests

### 3. Assertions
- Use specific assertions
- Test both positive and negative cases
- Test edge cases and error conditions

### 4. Performance
- Keep tests fast and focused
- Use parallel execution where possible
- Avoid unnecessary setup/teardown

## 🔄 Continuous Integration

### GitHub Actions
```yaml
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:e2e:run

- name: Generate Coverage Report
  run: npm run test:coverage
```

### Pre-commit Hooks
- Run tests before commit
- Check coverage thresholds
- Lint test files

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Add appropriate mocks
3. Test all user roles
4. Include error cases
5. Update documentation

## 📈 Metrics and Reporting

### Test Results
- Unit tests: ~50 tests
- Integration tests: ~30 tests
- E2E tests: ~20 tests
- Total coverage: >90%

### Performance
- Unit test suite: <30s
- Integration test suite: <60s
- E2E test suite: <5min

---

**Happy Testing! 🎉**
