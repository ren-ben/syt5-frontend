describe('template spec', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/analysis"]').click();


    cy.get('#app button.bg-primary').click();
    cy.get('#input-v-197').click();
    cy.get('#input-v-197').type('879ed661-1393');
    cy.get('#input-v-200').click();
    cy.get('#input-v-200').type('2026-01-03T22:48:46');
    cy.get('#input-v-233').click();
    cy.get('#input-v-233').type('1e2e');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.get('#input-v-135').click();
    cy.get('#input-v-135').type('1e2e');
    cy.get('#app tr:nth-child(1) button.text-error').click();
    cy.get('button.bg-error').click();
  })

  it('edit', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/analysis"]').click();


    cy.get('#input-v-135').click();
    cy.get('#input-v-135').type('test');
    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('#input-v-236').click();
    cy.get('#input-v-236').type('123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.get('#input-v-135').click();
    cy.get('#input-v-135').type('123');
    cy.get('#app i.mdi-pencil').click();
    cy.get('#input-v-280').click();
    cy.get('#input-v-280').clear();
    cy.get('#input-v-280').type('test');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
  })
})