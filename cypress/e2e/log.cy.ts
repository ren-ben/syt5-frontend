describe('log', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/log"] div.v-list-item-title').click();
  })
})
