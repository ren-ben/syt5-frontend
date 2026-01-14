describe('template spec', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/analysis"]').click();

    // CREATE ACTION
    cy.get('#app button.bg-primary').click();
    cy.get('[data-cy="crud-sId"]').click();
    cy.get('[data-cy="crud-sId"]').type('879ed661-1393');
    cy.get('[data-cy="crud-sStamp"]').click();
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46');
    cy.get('[data-cy="crud-comment"]').click();
    cy.get('[data-cy="crud-comment"]').type('1e2e');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY CREATE ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '1e2e'`).then((rows) => {
      expect(rows).to.have.length(1);
    });

    // DELETE ACTION
    cy.get('[data-cy="filter-comment"]').click();
    cy.get('[data-cy="filter-comment"]').type('1e2e');
    cy.get('#app tr:nth-child(1) button.text-error').click();
    cy.get('button.bg-error').click();

    // --- DB CHECK: VERIFY DELETE ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '1e2e'`).then((rows) => {
      expect(rows).to.have.length(0);
    });
  })

  it('edit', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a[href="/table/analysis"]').click();

    cy.get('#app button.bg-primary').click();
    cy.get('[data-cy="crud-sId"]').click();
    cy.get('[data-cy="crud-sId"]').type('879ed661-1393');
    cy.get('[data-cy="crud-sStamp"]').click();
    cy.get('[data-cy="crud-sStamp"]').type('2026-01-03T22:48:46');
    cy.get('[data-cy="crud-comment"]').click();
    cy.get('[data-cy="crud-comment"]').type('test123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // FIRST EDIT
    cy.get('[data-cy="filter-comment"]').click();
    cy.get('[data-cy="filter-comment"]').type('test123');
    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('[data-cy="crud-comment"]').click();
    cy.get('[data-cy="crud-comment"]').clear();
    cy.get('[data-cy="crud-comment"]').type('test123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY FIRST EDIT ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = 'test123test123'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });

    // SECOND EDIT
    cy.get('#app i.mdi-pencil').click();
    cy.get('[data-cy="crud-comment"]').click();
    cy.get('[data-cy="crud-comment"]').clear();
    cy.get('[data-cy="crud-comment"]').type('test123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY SECOND EDIT ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = 'test123test123test123'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });

    cy.get('[data-cy="filter-comment"]').click();
    cy.get('[data-cy="filter-comment"]').type('test123test123test123');

  })
})