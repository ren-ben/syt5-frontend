describe('Analysis & Sample - Edit & Error Handling', () => {
  const sId = `T${Date.now().toString().slice(-12)}`; 
  const sStamp = new Date().toISOString().slice(0, 19);
  let createdAnalysisId: number;
  let csrfToken: string;

  const getCsrfToken = () => {
    return cy.getCookie('XSRF-TOKEN').then((cookie) => cookie ? cookie.value : '');
  };

  before(() => {
    cy.visit('/');
    cy.wait(1000);

    getCsrfToken().then(token => {
      csrfToken = token;
      const headers = { 'X-XSRF-TOKEN': csrfToken };

      // DEBUG: Log Sample Data
      cy.log(`Creating Sample: ${sId}, ${sStamp}`);
      
      cy.request({
        method: 'POST',
        url: 'http://localhost:8040/api/samples',
        body: { s_id: sId, s_stamp: sStamp },
        headers: headers,
        failOnStatusCode: false
      });

      // DEBUG: Define Payload
      const analysisPayload = {
          lane: 1,
          pol: 50,
          nat: 50,
          comment: 'Original Comment'
      };

      // Log to Console (F12)
      console.log('Sending Analysis Payload:', analysisPayload);
      cy.log('Sending Analysis Payload (check console)');

      cy.request({
        method: 'POST',
        url: 'http://localhost:8040/api/analysis',
        body: analysisPayload,
        headers: headers
      }).then((res) => {
        // DEBUG: Log Response
        console.log('Analysis Create Response:', res.body);
        expect(res.status).to.be.oneOf([200, 201]);
        createdAnalysisId = res.body.aId;
      });
    });
  });

  it('should display validation errors when entering invalid data', () => {
    cy.visit('/table/analysis');
    
    // Find our row and click Edit
    // Wait for table to load
    cy.contains('tr', 'Original Comment', { timeout: 10000 })
      .find('.mdi-pencil')
      .parent()
      .click();
    
    // Check validation: Enter invalid POL (> 100)
    cy.get('.v-dialog').should('be.visible').within(() => {
      cy.contains('label', 'pol').parent().find('input').clear().type('150'); // Invalid
      cy.contains('button', 'Save').click();
    });

    // Verify Error Dialog/Message appears
    // Adjust selector based on your actual error dialog implementation
    cy.contains('Validation Error').should('be.visible');
    
    // Close error dialog
    cy.contains('button', 'OK').click();
  });

    it('should successfully edit an existing Analysis', () => {
    // 1. Refresh page
    cy.visit('/table/analysis');

    // 2. Find row directly (skip filtering if input selector is tricky)
    // This waits up to 10s for the row to appear in the table
    cy.contains('tr', 'Original Comment', { timeout: 10000 })
      .should('be.visible')
      .find('.mdi-pencil') // Find the pencil icon in that specific row
      .parent()            // Parent button
      .click();

    // 3. Edit form - AND FILL SAMPLE ID to satisfy validation
    cy.get('.v-dialog').should('be.visible').within(() => {
      // Re-fill Sample ID and Timestamp just to be safe
      // (The validation error says sId is required, so let's provide it)
      cy.contains('label', 'sId').parent().find('input').clear().type(sId);
      cy.contains('label', 'sStamp').parent().find('input').clear().type(sStamp);

      // Edit the other fields
      cy.contains('label', 'pol').parent().find('input').clear().type('99');
      cy.contains('label', 'comment').parent().find('input').clear().type('Edited via Cypress');
      
      // Save
      cy.contains('button', 'Save').click();
    });

    // 4. Verify UI update
    // (Wait for dialog to close)
    cy.get('.v-dialog').should('not.exist');
    cy.contains('Edited via Cypress', { timeout: 10000 }).should('be.visible');

    // 5. Verify DB update
    cy.request(`http://localhost:8040/api/analysis/${createdAnalysisId}`).then((res) => {
      expect(res.body.pol).to.eq(99);
      expect(res.body.comment).to.eq('Edited via Cypress');
    });
  });

});
