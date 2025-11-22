// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Mock API responses
beforeEach(() => {
  // Mock authentication endpoints
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      user: {
        id: 1,
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin',
      },
      token: 'mock-jwt-token',
    },
  }).as('loginRequest')

  cy.intercept('POST', '/api/auth/register', {
    statusCode: 201,
    body: {
      user: {
        id: 2,
        name: 'New User',
        email: 'newuser@test.com',
        role: 'team',
      },
    },
  }).as('registerRequest')

  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: {
      user: {
        id: 1,
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin',
      },
    },
  }).as('meRequest')

  cy.intercept('POST', '/api/auth/logout', {
    statusCode: 200,
    body: { message: 'Logged out' },
  }).as('logoutRequest')

  // Mock admin endpoints
  cy.intercept('GET', '/api/admin/users', {
    statusCode: 200,
    body: [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      },
      {
        id: 2,
        name: 'PM User',
        email: 'pm@test.com',
        role: 'pm',
      },
      {
        id: 3,
        name: 'Team User',
        email: 'team@test.com',
        role: 'team',
      },
      {
        id: 4,
        name: 'Client User',
        email: 'client@test.com',
        role: 'client',
      },
    ],
  }).as('getUsersRequest')

  cy.intercept('POST', '/api/admin/users', {
    statusCode: 201,
    body: {
      id: 5,
      name: 'New User',
      email: 'newuser@test.com',
      role: 'team',
    },
  }).as('createUserRequest')

  cy.intercept('PUT', '/api/admin/users/*', {
    statusCode: 200,
    body: {
      id: 1,
      name: 'Updated User',
      email: 'updated@test.com',
      role: 'team',
    },
  }).as('updateUserRequest')

  cy.intercept('DELETE', '/api/admin/users/*', {
    statusCode: 200,
    body: { message: 'User deleted' },
  }).as('deleteUserRequest')

  // Mock project endpoints
  cy.intercept('GET', '/api/projects', {
    statusCode: 200,
    body: [
      {
        id: 1,
        name: 'E-commerce Website',
        client_id: 4,
        status: 'active',
        description: 'A comprehensive e-commerce platform',
      },
      {
        id: 2,
        name: 'Mobile App',
        client_id: 4,
        status: 'in_progress',
        description: 'Cross-platform mobile application',
      },
    ],
  }).as('getProjectsRequest')
})
