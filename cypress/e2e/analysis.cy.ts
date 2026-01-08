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
    cy.get('#input-v-197').click();
    cy.get('#input-v-197').type('879ed661-1393');
    cy.get('#input-v-200').click();
    cy.get('#input-v-200').type('2026-01-03T22:48:46');
    cy.get('#input-v-233').click();
    cy.get('#input-v-233').type('1e2e');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY CREATE ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = '1e2e'`).then((rows) => {
      expect(rows).to.have.length(1);
    });

    // DELETE ACTION
    cy.get('#input-v-135').click();
    cy.get('#input-v-135').type('1e2e');
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

    // FIRST EDIT
    cy.get('#input-v-135').click();
    cy.get('#input-v-135').type('test123');
    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('#input-v-236').click();
    cy.get('#input-v-236').clear();
    cy.get('#input-v-236').type('test1234');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY FIRST EDIT ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = 'test1234'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });

    // SECOND EDIT
    cy.get('#app i.mdi-pencil').click();
    cy.get('#input-v-280').click();
    cy.get('#input-v-280').clear();
    cy.get('#input-v-280').type('test123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY SECOND EDIT ---
    cy.task('queryDB', `SELECT * FROM venlab.analysis WHERE comment = 'test123'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });
  })
})