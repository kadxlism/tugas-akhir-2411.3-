/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'admin' | 'pm' | 'team' | 'client'): Chainable<void>
      loginAsAdmin(): Chainable<void>
      loginAsPM(): Chainable<void>
      loginAsTeam(): Chainable<void>
      loginAsClient(): Chainable<void>
      logout(): Chainable<void>
      visitWithAuth(url: string, role?: 'admin' | 'pm' | 'team' | 'client'): Chainable<void>
    }
  }
}

const userRoles = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
  },
  pm: {
    id: 2,
    name: 'PM User',
    email: 'pm@test.com',
    role: 'pm',
  },
  team: {
    id: 3,
    name: 'Team User',
    email: 'team@test.com',
    role: 'team',
  },
  client: {
    id: 4,
    name: 'Client User',
    email: 'client@test.com',
    role: 'client',
  },
}

Cypress.Commands.add('loginAs', (role: 'admin' | 'pm' | 'team' | 'client') => {
  const user = userRoles[role]
  
  // Mock the login API call
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      user,
      token: `mock-token-${role}`,
    },
  }).as('loginRequest')

  // Mock the me API call
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { user },
  }).as('meRequest')

  // Visit login page and perform login
  cy.visit('/login')
  cy.get('input[name="email"]').type(user.email)
  cy.get('input[name="password"]').type('password123')
  cy.get('button[type="submit"]').click()

  // Wait for login to complete
  cy.wait('@loginRequest')
  cy.wait('@meRequest')
})

Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginAs('admin')
})

Cypress.Commands.add('loginAsPM', () => {
  cy.loginAs('pm')
})

Cypress.Commands.add('loginAsTeam', () => {
  cy.loginAs('team')
})

Cypress.Commands.add('loginAsClient', () => {
  cy.loginAs('client')
})

Cypress.Commands.add('logout', () => {
  cy.intercept('POST', '/api/auth/logout', {
    statusCode: 200,
    body: { message: 'Logged out' },
  }).as('logoutRequest')

  cy.get('button').contains('Logout').click()
  cy.wait('@logoutRequest')
})

Cypress.Commands.add('visitWithAuth', (url: string, role: 'admin' | 'pm' | 'team' | 'client' = 'admin') => {
  cy.loginAs(role)
  cy.visit(url)
})
