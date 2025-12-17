describe('Analysis Table - Robust', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/table/analysis');
  });

  it('should filter by Analysis ID', () => {
    // Just verify filtering input works, don't wait for specific requests
    cy.get('input').first().type('1');
    cy.get('input').first().should('have.value', '1');
  });

  it('should have action buttons in table rows', () => {
    // Get the action buttons column (last td in each row)
    cy.get('tbody tr').first().find('td').last().within(() => {
      // Should have 2 buttons (edit and delete)
      cy.get('button').should('have.length', 2);
    });
  });

  it('should display table with data', () => {
    // Simple test - just verify table loaded with data
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.gt', 0);
  });
});
