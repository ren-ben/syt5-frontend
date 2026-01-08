describe('template spec', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a.bg-primary div.v-list-item-title').click();
    cy.get('#app button.bg-primary').click();
    cy.get('#input-v-99').click();
    cy.get('#input-v-99').type('test000');
    cy.get('button.v-btn--variant-flat').click();
    cy.get('#input-v-19').click();
    cy.get('#input-v-19').type('test000');
    cy.get('#app button.v-btn--icon.text-error').click();
  })

  it('edit', () => {
    cy.visit('http://localhost:5173/')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();

    cy.get('#input-v-13').click();
    cy.get('#input-v-16').click();
    cy.get('#input-v-19').click();
    cy.get('#input-v-19').type('test{enter}');
    cy.get('#app div.v-row').click();
    cy.get('#app tr:nth-child(1) button.text-primary').click();

    cy.get('#input-v-99').click();
    cy.get('#input-v-99').type('123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('#input-v-122').click();
    cy.get('#input-v-122').clear();
    cy.get('#input-v-122').type('test');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
  })


})