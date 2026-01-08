describe('box', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/table/analysis')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();

    // Navigate to Box table
    cy.get('#app a[href="/table/box"] div.v-list-item-title').click();

    // CREATE ACTION
    cy.get('#app button.bg-primary').click();

    // Input Box Name (Assuming input-v-173 is Name/ID)
    cy.get('#input-v-173').click();
    cy.get('#input-v-173').clear();
    cy.get('#input-v-173').type('B999');

    // Input Comment (Assuming input-v-176 is Comment)
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').clear();
    cy.get('#input-v-176').type('test999');

    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY CREATE ---
    // Verifies that a box with name 'B999' and comment 'test999' exists
    cy.task('queryDB', `SELECT * FROM venlab.box WHERE b_id = 'B999'`).then((rows) => {
      expect(rows).to.have.length(1);
      expect(rows[0].name).to.equal('test999'); // Optional: check specific field content
    });

    // DELETE ACTION
    cy.get('#input-v-96').click();
    cy.get('#input-v-96').type('B999'); // Search for the box
    cy.get('#app i.mdi-delete').click();
    cy.get('button.bg-error span.v-btn__content').click();

    // --- DB CHECK: VERIFY DELETE ---
    // Verifies the box is gone
    cy.task('queryDB', `SELECT * FROM venlab.box WHERE b_id = 'B999'`).then((rows) => {
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
    cy.get('#app a[href="/table/box"] div.v-list-item-title').click();
    
    cy.get('#app th.v-data-table__th--sorted span').click();
    cy.get('#input-v-99').click();
    cy.get('#input-v-96').click();
    cy.get('#input-v-96').type('B000');
    cy.get('#app button.text-primary').click();
    cy.get('#input-v-176').click();
    cy.get('#input-v-176').clear();
    cy.get('#input-v-176').type('test000123');
    cy.get('div.v-card-actions').click();
    cy.get('button.v-btn--variant-flat').click();
    cy.get('#app button.text-primary').click();
    cy.task('queryDB', `SELECT * FROM venlab.box WHERE name LIKE 'test000123'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });
    cy.get('#input-v-196').click();
    cy.get('#input-v-196').clear();
    cy.get('#input-v-196').type('test000');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();
    cy.task('queryDB', `SELECT * FROM venlab.box WHERE name LIKE 'test000'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });
  })
})
