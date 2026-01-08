describe('box', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/box"] div.v-list-item-title').click();
    cy.get('#app button.bg-primary').click();
    cy.get('#input-v-173').click();
    cy.get('#input-v-173').clear();
    cy.get('#input-v-173').type('B999');
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').clear();
    cy.get('#input-v-176').type('test999');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.get('#input-v-96').click();
    cy.get('#input-v-96').type('B999');
    cy.get('#app i.mdi-delete').click();
    cy.get('button.bg-error span.v-btn__content').click();
  })

  it('edit', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/box"] div.v-list-item-title').click();
    cy.get('#input-v-185').click();
    cy.get('#input-v-185').type('test000');
    cy.get('#app button.text-primary').click();
    cy.get('#input-v-271').click();
    cy.get('#input-v-271').type('test');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.get('#app i.mdi-pencil').click();
    cy.get('div.v-dialog').click();
    cy.get('#input-v-291').clear();
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
  })
})