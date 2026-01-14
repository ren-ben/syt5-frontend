describe('template spec', () => {
  it('create and delete', () => {
    cy.visit('http://localhost:5173/')
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('#app button.submit-btn').click();
    cy.get('#app a.bg-primary div.v-list-item-title').click();

    // CREATE ACTION
    cy.get('#app button.bg-primary').click();
    cy.get('#input-v-99').click();
    cy.get('#input-v-99').type('test111');
    cy.get('button.v-btn--variant-flat').click();
    cy.wait(200)
    // --- DB CHECK: VERIFY CREATE ---
    // Verifies a record with name 'test000' was created
    // REPLACE 'sample' with the actual table name (e.g., venlab.users, venlab.items)
    cy.task('queryDB', `SELECT * FROM venlab.sample WHERE name = 'test111'`).then((rows) => {
      expect(rows).to.have.length(1);
    });

    // DELETE ACTION
    cy.get('#input-v-19').click();
    cy.get('#input-v-19').type('test111');
    cy.get('#app button.v-btn--icon.text-error').click();
    // Note: If your app has a "Confirm Delete" popup, you might need an extra click command here.


    cy.get('button.bg-error').click();
    // --- DB CHECK: VERIFY DELETE ---
    cy.task('queryDB', `SELECT * FROM venlab.sample WHERE name = 'test111'`).then((rows) => {
      expect(rows).to.have.length(0);
    });
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

    // SEARCH FOR EXISTING RECORD
    cy.get('#input-v-19').click();
    cy.get('#input-v-19').type('test000{enter}');
    cy.get('#app div.v-row').click();
    cy.get('#app tr:nth-child(1) button.text-primary').click();

    // FIRST EDIT (Change name to test000123)
    cy.get('#input-v-99').click();
    cy.get('#input-v-99').clear();
    cy.get('#input-v-99').type('test000123');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY FIRST EDIT ---
    // Check if the name updated to 'test000123'
    cy.task('queryDB', `SELECT * FROM venlab.sample WHERE name = 'test000123'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });

    // SECOND EDIT (Change name back to test000)
    cy.get('#app tr:nth-child(1) button.text-primary span.v-btn__content i.mdi').click();
    cy.get('#input-v-122').click();
    cy.get('#input-v-122').clear();
    cy.get('#input-v-122').type('test000');
    cy.get('button.v-btn--variant-flat span.v-btn__content').click();

    // --- DB CHECK: VERIFY SECOND EDIT ---
    // Check if the name updated back to 'test000'
    cy.task('queryDB', `SELECT * FROM venlab.sample WHERE name = 'test000'`).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });
  })
})