describe('Rick and Morty Explorer smoke', () => {
  it('loads explorers and compare page', () => {
    cy.visit('/characters')
    cy.contains('h1', /characters explorer/i).should('be.visible')

    cy.contains('a', /^Episodes$/).click()
    cy.url().should('include', '/episodes')
    cy.contains('h1', /episodes explorer/i).should('be.visible')

    cy.contains('a', /^Compare/).click()
    cy.url().should('include', '/compare')
    cy.contains(/add two characters to start comparing/i).should('be.visible')
  })

  it('syncs character name filter into the URL', () => {
    cy.visit('/characters')
    cy.get('#characters-filter-name').type('rick')
    cy.location('search').should('include', 'name=rick')
    cy.location('search').should('include', 'page=1')
  })
})
