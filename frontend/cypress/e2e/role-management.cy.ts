describe('Role Management System', () => {
  describe('Admin Role Access', () => {
    it('should allow admin to access all admin-only pages', () => {
      cy.loginAsAdmin()
      
      // Test admin can access user management
      cy.visit('/admin/users')
      cy.url().should('include', '/admin/users')
      cy.get('h1').should('contain', 'User Management')
      
      // Test admin can access clients page
      cy.visit('/clients')
      cy.url().should('include', '/clients')
      cy.get('h1').should('contain', 'Clients')
      
      // Test admin can access tasks page
      cy.visit('/tasks')
      cy.url().should('include', '/tasks')
      cy.get('h1').should('contain', 'Tasks')
      
      // Test admin can access timeline page
      cy.visit('/timeline')
      cy.url().should('include', '/timeline')
      cy.get('h1').should('contain', 'Timeline')
    })

    it('should allow admin to create new users', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.get('button').contains('Add User').click()
      cy.url().should('include', '/users/create')
      
      cy.get('input[name="name"]').type('New Test User')
      cy.get('input[name="email"]').type('newuser@test.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      cy.get('button[type="submit"]').click()
      
      cy.wait('@createUserRequest')
      cy.url().should('include', '/admin/users')
      cy.get('.toast').should('contain', 'User created successfully')
    })

    it('should allow admin to edit users', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.get('table tbody tr').first().find('button').contains('Edit').click()
      cy.url().should('include', '/edit')
      
      cy.get('input[name="name"]').clear().type('Updated User Name')
      cy.get('input[name="email"]').clear().type('updated@test.com')
      cy.get('select[name="role"]').select('pm')
      
      cy.get('button[type="submit"]').click()
      
      cy.wait('@updateUserRequest')
      cy.url().should('include', '/admin/users')
      cy.get('.toast').should('contain', 'User updated successfully')
    })

    it('should allow admin to delete users', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.get('table tbody tr').first().find('button').contains('Delete').click()
      cy.get('.modal').should('be.visible')
      cy.get('.modal button').contains('Confirm').click()
      
      cy.wait('@deleteUserRequest')
      cy.get('.toast').should('contain', 'User deleted successfully')
    })
  })

  describe('PM Role Access', () => {
    it('should allow PM to access dashboard but not admin pages', () => {
      cy.loginAsPM()
      
      // PM should be able to access dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
      
      // PM should not be able to access admin pages
      cy.visit('/admin/users')
      cy.url().should('include', '/unauthorized')
      cy.get('h1').should('contain', 'Unauthorized')
      
      cy.visit('/clients')
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('Team Role Access', () => {
    it('should allow team member to access dashboard but not admin pages', () => {
      cy.loginAsTeam()
      
      // Team member should be able to access dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
      
      // Team member should not be able to access admin pages
      cy.visit('/admin/users')
      cy.url().should('include', '/unauthorized')
      
      cy.visit('/clients')
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('Client Role Access', () => {
    it('should allow client to access dashboard but not admin pages', () => {
      cy.loginAsClient()
      
      // Client should be able to access dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
      
      // Client should not be able to access admin pages
      cy.visit('/admin/users')
      cy.url().should('include', '/unauthorized')
      
      cy.visit('/clients')
      cy.url().should('include', '/unauthorized')
    })
  })

  describe('Navigation Based on Role', () => {
    it('should show admin navigation for admin users', () => {
      cy.loginAsAdmin()
      cy.visit('/dashboard')
      
      // Check that admin navigation items are visible
      cy.get('nav').should('contain', 'Clients')
      cy.get('nav').should('contain', 'Projects')
      cy.get('nav').should('contain', 'Tasks')
      cy.get('nav').should('contain', 'Timeline')
      cy.get('nav').should('contain', 'Time Tracker')
      cy.get('nav').should('contain', 'Assign Users')
    })

    it('should hide admin navigation for non-admin users', () => {
      cy.loginAsTeam()
      cy.visit('/dashboard')
      
      // Check that admin navigation items are not visible
      cy.get('nav').should('not.contain', 'Clients')
      cy.get('nav').should('not.contain', 'Projects')
      cy.get('nav').should('not.contain', 'Tasks')
      cy.get('nav').should('not.contain', 'Timeline')
      cy.get('nav').should('not.contain', 'Time Tracker')
      cy.get('nav').should('not.contain', 'Assign Users')
    })
  })

  describe('Authentication Flow', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should allow user registration with role selection', () => {
      cy.visit('/register')
      
      cy.get('input[name="name"]').type('New User')
      cy.get('input[name="email"]').type('newuser@test.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="password_confirmation"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      cy.get('button[type="submit"]').click()
      
      cy.wait('@registerRequest')
      cy.url().should('include', '/dashboard')
    })

    it('should handle login with different roles', () => {
      // Test admin login
      cy.loginAsAdmin()
      cy.visit('/dashboard')
      cy.get('nav').should('contain', 'Clients')
      
      cy.logout()
      
      // Test team login
      cy.loginAsTeam()
      cy.visit('/dashboard')
      cy.get('nav').should('not.contain', 'Clients')
    })
  })

  describe('Error Handling', () => {
    it('should show unauthorized page for insufficient permissions', () => {
      cy.loginAsTeam()
      cy.visit('/admin/users')
      
      cy.url().should('include', '/unauthorized')
      cy.get('h1').should('contain', 'Unauthorized')
      cy.get('p').should('contain', 'You do not have permission to access this page')
    })

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/admin/users', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('getUsersError')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.wait('@getUsersError')
      cy.get('.error').should('contain', 'Failed to load users')
    })
  })
})
