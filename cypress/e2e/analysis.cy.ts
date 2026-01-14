describe('template spec', () => {

  it('create and delete', () => {
    const comment = `e2e_${Date.now()}`

    cy.visit('http://localhost:5173/table/analysis')

    cy.get('#username').type('admin')
    cy.get('#password').type('admin123')

    cy.intercept('POST', '**/api/auth/login').as('loginReq')
    cy.get('#app button.submit-btn').click()
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200)

    // Wait for page to be ready instead of clicking a nav link
    cy.get('#app button.bg-primary', { timeout: 20000 }).should('be.visible')

    // CREATE ACTION
    cy.get('#app button.bg-primary').click()

    cy.get('[data-cy="crud-sId"]').type('879ed661-1393')
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46')
    cy.get('[data-cy="crud-comment"]').type(comment)

    // wait for create request
    cy.intercept('POST', '**/api/**').as('createReq')
    cy.get('button.v-btn--variant-flat span.v-btn__content').click()
    cy.wait('@createReq').its('response.statusCode').should('be.oneOf', [200, 201])

    // DB CHECK (now it won't race)
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '${comment}'`)
      .then((rows) => expect(rows).to.have.length(1))

    // DELETE ACTION
    cy.get('[data-cy="filter-comment"]').clear().type(comment)

    cy.get('#app tr:nth-child(1) button.text-error')
      .scrollIntoView()
      .click({ force: true })

    cy.get('button.bg-error').click()

    // wait for delete request (optional but recommended)
    cy.intercept('DELETE', '**/api/**').as('deleteReq')
    // if delete request happens on confirm click, put intercept before confirm click instead

    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '${comment}'`)
      .then((rows) => expect(rows).to.have.length(0))
  })

  it('edit', () => {
    const comment = `edit_${Date.now()}`

    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').type('admin')
    cy.get('#password').type('admin123')

    cy.intercept('POST', '**/api/auth/login').as('loginReq')
    cy.get('#app button.submit-btn').click()
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200)

    cy.get('#app button.bg-primary', { timeout: 20000 }).should('be.visible')

    // create row to edit
    cy.get('#app button.bg-primary').click()
    cy.get('[data-cy="crud-sId"]').type('879ed661-1393')
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46')
    cy.get('[data-cy="crud-comment"]').type(comment)

    cy.intercept('POST', '**/api/**').as('createReq')
    cy.get('button.v-btn--variant-flat span.v-btn__content').click()
    cy.wait('@createReq')

    // filter to row
    cy.get('[data-cy="filter-comment"]').clear().type(comment)

    // click EDIT button (not the i tag)
    cy.get('#app tr:nth-child(1) button.text-primary')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true })

    // edit comment
    const newComment = `${comment}_edited`
    cy.get('[data-cy="crud-comment"]').clear().type(newComment)

    cy.intercept(['PUT','PATCH'], '**/api/**').as('editReq')
    cy.get('button.v-btn--variant-flat span.v-btn__content').click()
    cy.wait('@editReq')
  })
})
