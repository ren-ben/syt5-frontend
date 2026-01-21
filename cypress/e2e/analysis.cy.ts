describe('template spec', () => {

  const loginAndOpenAnalysis = () => {
    cy.visit('http://localhost:5173/table/analysis')

    cy.get('#username').type('admin')
    cy.get('#password').type('admin123')

    cy.intercept('POST', '**/api/auth/login').as('loginReq')
    cy.get('#app button.submit-btn').click()
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200)

    // your auth store redirects to '/' after login, so force going to analysis page
    cy.visit('http://localhost:5173/table/analysis')

    // ✅ wait for analysis table to actually be mounted
    cy.get('#app a[href="/table/analysis"]', { timeout: 20000 }).should('exist') // nav exists
    cy.get('[data-cy="filter-comment"]', { timeout: 20000 }).should('be.visible') // analysis-only filter
    cy.get('[data-cy="crud-sidebar-add-button"]', { timeout: 20000 }).should('be.visible') // create button
  }

  it('create and delete', () => {
    const comment = `e2e_${Date.now()}`
    loginAndOpenAnalysis()

    // CREATE ACTION (analysis)
    cy.get('[data-cy="crud-sidebar-add-button"]').click()

    cy.get('.v-dialog', { timeout: 20000 }).should('be.visible')
    cy.get('[data-cy="crud-sId"]', { timeout: 20000 }).should('be.visible').type('879ed661-1393')
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46')
    cy.get('[data-cy="crud-comment"]').type(comment)

    cy.intercept('POST', '**/api/**').as('createReq')
    cy.contains('button', 'Create').click({ force: true }) // more stable than deep selector
    cy.wait('@createReq').its('response.statusCode').should('be.oneOf', [200, 201])

    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '${comment}'`)
      .then((rows) => expect(rows).to.have.length(1))

    // DELETE
    cy.get('[data-cy="filter-comment"]').find('input').clear().type(comment)

    // intercept BEFORE confirm click
    cy.intercept('DELETE', '**/api/**').as('deleteReq')
    cy.get('#app tr:nth-child(1) button.text-error').scrollIntoView().click({ force: true })
    cy.contains('button', 'Delete').click({ force: true })
    cy.wait('@deleteReq').its('response.statusCode').should('be.oneOf', [200, 204])

    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '${comment}'`)
      .then((rows) => expect(rows).to.have.length(0))
  })

  it('edit', () => {
    const comment = `edit_${Date.now()}`
    loginAndOpenAnalysis()

    // create row to edit
    cy.get('[data-cy="crud-sidebar-add-button"]').click()
    cy.get('.v-dialog', { timeout: 20000 }).should('be.visible')
    cy.get('[data-cy="crud-sId"]').type('879ed661-1393')
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46')
    cy.get('[data-cy="crud-comment"]').type(comment)

    cy.intercept('POST', '**/api/**').as('createReq')
    cy.contains('button', 'Create').click({ force: true })
    cy.wait('@createReq')

    // filter row
   cy.get('[data-cy="filter-comment"]').find('input').clear().type(comment)

    // EDIT
    cy.get('#app tr:nth-child(1) button.text-primary')
      .scrollIntoView()
      .click({ force: true })

    const newComment = `${comment}_edited`
    cy.get('[data-cy="crud-comment"]').find('input').clear().type(newComment)

    cy.contains('button', 'Save').click({ force: true })
  })
})
