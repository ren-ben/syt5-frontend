describe('csv export check', () => {
  it('analysis', () => {
    cy.visit('https://venlab.net')

    cy.get('#username').type('admin')
    cy.get('#password').type('admin123')


     cy.intercept('POST', '**/api/auth/login').as('loginReq')
     cy.get('#app button.submit-btn').click()
     cy.wait('@loginReq').its('response.statusCode').should('eq', 200)


     cy.visit('https://venlab.net/table/analysis')

     cy.get('.mdi-download').should('be.visible').click();

     cy.readFile('cypress/downloads/analyses_export.csv').should('exist');

     cy.readFile('cypress/downloads/analyses_export.csv')
           .its('length')
           .should('be.gt', 0);

       cy.get('.v-field__input .v-select__selection-text')
         .invoke('text')
         .then((text) => {
           const itemsPerPage = parseInt(text.trim(), 10);

           cy.get('tbody tr').its('length').should('eq', itemsPerPage);

           cy.get('table tr').its('length').should('eq', itemsPerPage + 1);
         });

  })
})
