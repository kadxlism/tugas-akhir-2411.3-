describe('User Management E2E Tests', () => {
  describe('Admin User Management', () => {
    it('should allow admin to manage users', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Should see user management page
      cy.get('h1').should('contain', 'User Management')
      cy.get('button').contains('Add User').should('be.visible')
      
      // Should see user list
      cy.get('table tbody tr').should('have.length.at.least', 4)
      cy.get('td').should('contain', 'Admin User')
      cy.get('td').should('contain', 'PM User')
      cy.get('td').should('contain', 'Team User')
      cy.get('td').should('contain', 'Client User')
    })

    it('should allow admin to create new user', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Should open create user modal
      cy.get('h2').should('contain', 'Create User')
      
      // Fill form
      cy.get('input[name="name"]').type('New Test User')
      cy.get('input[name="email"]').type('newtest@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Should show success message
      cy.get('.toast').should('contain', 'User created successfully')
      
      // Should close modal
      cy.get('h2').should('not.contain', 'Create User')
    })

    it('should allow admin to edit existing user', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click edit button for first user
      cy.get('table tbody tr').first().find('button').contains('Edit').click()
      
      // Should open edit user modal
      cy.get('h2').should('contain', 'Edit User')
      
      // Update name
      cy.get('input[name="name"]').clear().type('Updated User Name')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Should show success message
      cy.get('.toast').should('contain', 'User updated successfully')
    })

    it('should allow admin to delete user', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click delete button for first user
      cy.get('table tbody tr').first().find('button').contains('Delete').click()
      
      // Should show confirmation modal
      cy.get('.modal').should('be.visible')
      cy.get('h3').should('contain', 'Confirm Deletion')
      cy.get('p').should('contain', 'Are you sure you want to delete this user?')
      
      // Confirm deletion
      cy.get('.modal button').contains('Confirm').click()
      
      // Should show success message
      cy.get('.toast').should('contain', 'User deleted successfully')
    })

    it('should filter users by role', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Filter by admin role
      cy.get('select[name="role_filter"]').select('admin')
      
      // Should only show admin users
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('td').should('contain', 'Admin User')
      cy.get('td').should('not.contain', 'PM User')
    })

    it('should search users by name or email', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Search for admin
      cy.get('input[placeholder*="search"]').type('admin')
      
      // Should only show admin users
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('td').should('contain', 'Admin User')
    })
  })

  describe('Non-Admin Access Control', () => {
    it('should prevent PM from accessing user management', () => {
      cy.loginAsPM()
      cy.visit('/admin/users')
      
      // Should redirect to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('h1').should('contain', 'Unauthorized')
    })

    it('should prevent team member from accessing user management', () => {
      cy.loginAsTeam()
      cy.visit('/admin/users')
      
      // Should redirect to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('h1').should('contain', 'Unauthorized')
    })

    it('should prevent client from accessing user management', () => {
      cy.loginAsClient()
      cy.visit('/admin/users')
      
      // Should redirect to unauthorized page
      cy.url().should('include', '/unauthorized')
      cy.get('h1').should('contain', 'Unauthorized')
    })
  })

  describe('User Management Validation', () => {
    it('should validate required fields when creating user', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click()
      
      // Should show validation errors
      cy.get('.error').should('contain', 'Name is required')
      cy.get('.error').should('contain', 'Email is required')
      cy.get('.error').should('contain', 'Password is required')
    })

    it('should validate email format', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Fill form with invalid email
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Should show validation error
      cy.get('.error').should('contain', 'Invalid email format')
    })

    it('should validate password strength', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Fill form with weak password
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Should show validation error
      cy.get('.error').should('contain', 'Password must be at least 6 characters')
    })

    it('should prevent duplicate email addresses', () => {
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Fill form with existing email
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('admin@test.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.get('.error').should('contain', 'Email already exists')
    })
  })

  describe('User Management Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/admin/users', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('getUsersError')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.wait('@getUsersError')
      cy.get('.error').should('contain', 'Failed to load users')
    })

    it('should handle create user errors', () => {
      // Mock create user error
      cy.intercept('POST', '/api/admin/users', {
        statusCode: 422,
        body: {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email field is required.'],
          },
        },
      }).as('createUserError')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Fill form
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      cy.wait('@createUserError')
      cy.get('.error').should('contain', 'The email field is required')
    })

    it('should handle update user errors', () => {
      // Mock update user error
      cy.intercept('PUT', '/api/admin/users/*', {
        statusCode: 500,
        body: { message: 'Update failed' },
      }).as('updateUserError')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click edit button
      cy.get('table tbody tr').first().find('button').contains('Edit').click()
      
      // Update name
      cy.get('input[name="name"]').clear().type('Updated Name')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      cy.wait('@updateUserError')
      cy.get('.error').should('contain', 'Update failed')
    })

    it('should handle delete user errors', () => {
      // Mock delete user error
      cy.intercept('DELETE', '/api/admin/users/*', {
        statusCode: 500,
        body: { message: 'Delete failed' },
      }).as('deleteUserError')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click delete button
      cy.get('table tbody tr').first().find('button').contains('Delete').click()
      
      // Confirm deletion
      cy.get('.modal button').contains('Confirm').click()
      
      cy.wait('@deleteUserError')
      cy.get('.error').should('contain', 'Delete failed')
    })
  })

  describe('User Management Loading States', () => {
    it('should show loading state while fetching users', () => {
      // Mock delayed response
      cy.intercept('GET', '/api/admin/users', {
        delay: 2000,
        statusCode: 200,
        body: [],
      }).as('getUsersDelayed')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      cy.get('.loading').should('be.visible')
      cy.get('.loading').should('contain', 'Loading users...')
      
      cy.wait('@getUsersDelayed')
      cy.get('.loading').should('not.exist')
    })

    it('should show loading state during user creation', () => {
      // Mock delayed create response
      cy.intercept('POST', '/api/admin/users', {
        delay: 2000,
        statusCode: 201,
        body: { id: 1, name: 'Test User' },
      }).as('createUserDelayed')

      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Click add user button
      cy.get('button').contains('Add User').click()
      
      // Fill form
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('team')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      cy.get('.loading').should('be.visible')
      cy.get('.loading').should('contain', 'Creating user...')
      
      cy.wait('@createUserDelayed')
      cy.get('.loading').should('not.exist')
    })
  })

  describe('User Management Responsiveness', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-6')
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Should show mobile-friendly layout
      cy.get('h1').should('be.visible')
      cy.get('button').contains('Add User').should('be.visible')
      
      // Table should be scrollable
      cy.get('table').should('be.visible')
      cy.get('table').should('have.class', 'overflow-x-auto')
    })

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2')
      cy.loginAsAdmin()
      cy.visit('/admin/users')
      
      // Should show tablet-friendly layout
      cy.get('h1').should('be.visible')
      cy.get('button').contains('Add User').should('be.visible')
      cy.get('table').should('be.visible')
    })
  })
})
