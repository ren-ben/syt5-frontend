describe('template spec', () => {
  it('create delete', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/boxpos"] div.v-list-item-title').click();

    cy.get('#app button.bg-primary').click();
    cy.get('#input-v-173').click();
    cy.get('#input-v-173').type('B000');
    cy.get('#input-v-170').click();

    cy.get('#input-v-170').click();
    cy.get('#input-v-170').clear();
    cy.get('#input-v-170').type('1');
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').type('879ed661-1393');
    cy.get('#input-v-179').click();
    cy.get('#input-v-179').type('2026-01-03T22:48:46');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    //cy.get('#input-v-102').click();
    //cy.get('#input-v-102').type('879ed661-1393');
  })

  it('edit', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/boxpos"] div.v-list-item-title').click();

    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').clear();
    cy.get('#input-v-176').type('879ed661-1393');
    cy.get('#input-v-179').click();
    cy.get('#input-v-179').clear();
    cy.get('#input-v-179').type('2026-01-03T22:48:46');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
  })
})