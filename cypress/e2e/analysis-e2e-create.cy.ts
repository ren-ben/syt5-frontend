describe('Analysis E2E - Create and Verify', () => {
  // Generate unique test data for each run
  const testData = {
    sId: `TEST${Date.now()}`, // Unique Sample ID
    sStamp: new Date().toISOString().slice(0, 19), // Current timestamp
    lane: 1,
    pol: 75,
    nat: 50,
    kal: 30,
    an: 10,
    glu: 20,
    dry: 5,
    comment: 'E2E Test Analysis'
  };

  before(() => {
    // First, create a Sample (Analysis requires a valid Sample to exist)
    cy.request({
      method: 'POST',
      url: 'http://localhost:8040/api/samples',
      body: {
        s_id: testData.sId,
        s_stamp: testData.sStamp
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.log('Sample created successfully');
    });
  });

  it('should create a new analysis through UI and verify in database', () => {
    // Step 1: Visit the Analysis table page
    cy.visit('http://localhost:5173/table/analysis');
    cy.wait(1000);

    // Step 2: Open the Create Dialog
    // Try to find and click the "+" button (adjust selector based on your UI)
    cy.get('button').contains('+').click({ force: true });
    cy.wait(500); // Wait for dialog animation

    // Verify dialog is open
    cy.get('.v-dialog').should('be.visible');

    // Step 3: Fill in the form
    // Find inputs by their labels or position
    cy.get('.v-dialog').within(() => {
      // Fill Sample ID
      cy.contains('label', 'sId').parent().find('input').clear().type(testData.sId);
      
      // Fill Sample Timestamp
      cy.contains('label', 'sStamp').parent().find('input').clear().type(testData.sStamp);
      
      // Fill Lane
      cy.contains('label', 'lane').parent().find('input').clear().type(testData.lane);
      
      // Fill POL
      cy.contains('label', 'pol').parent().find('input').clear().type(testData.pol);
      
      // Fill NAT
      cy.contains('label', 'nat').parent().find('input').clear().type(testData.nat);
      
      // Fill KAL
      cy.contains('label', 'kal').parent().find('input').clear().type(testData.kal);
      
      // Fill Comment
      cy.contains('label', 'comment').parent().find('input').type(testData.comment);
    });

    // Step 4: Submit the form
    cy.intercept('POST', '**/api/analysis').as('createAnalysis');
    cy.get('.v-dialog').contains('button', 'Save').click();
    
    // Step 5: Wait for API call to complete
    cy.wait('@createAnalysis').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      cy.log('Analysis created via API');
    });

    // Step 6: Verify dialog closed
    cy.get('.v-dialog').should('not.be.visible');

    // Step 7: Verify the new record appears in the table
    cy.get('table tbody tr').contains(testData.comment).should('be.visible');

    // Step 8: Verify in database via API call
    cy.request({
      method: 'GET',
      url: 'http://localhost:8040/api/analysis',
      qs: {
        page: 0,
        size: 100
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      
      // Find our created analysis
      const createdAnalysis = response.body.content.find(
        (a) => a.comment === testData.comment
      );
      
      // Assert it exists
      expect(createdAnalysis).to.exist;
      
      // Verify all fields were saved correctly
      expect(createdAnalysis.pol).to.eq(testData.pol);
      expect(createdAnalysis.nat).to.eq(testData.nat);
      expect(createdAnalysis.kal).to.eq(testData.kal);
      expect(createdAnalysis.lane).to.eq(testData.lane);
      
      cy.log('✅ Analysis verified in database!');
      cy.log(`Analysis ID: ${createdAnalysis.aId}`);
    });
  });

  after(() => {
    // Cleanup: Delete the test data
    cy.request('GET', 'http://localhost:8040/api/analysis').then((response) => {
      const testAnalysis = response.body.content.find(
        (a) => a.comment === testData.comment
      );
      
      if (testAnalysis) {
        cy.request('DELETE', `http://localhost:8040/api/analysis/${testAnalysis.aId}`);
        cy.log('Test analysis cleaned up');
      }
    });

    // Delete the test sample
    cy.request('DELETE', `http://localhost:8040/api/samples/${testData.sId},${testData.sStamp}`);
    cy.log('Test sample cleaned up');
  });
});
