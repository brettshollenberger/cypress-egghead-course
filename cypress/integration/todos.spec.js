describe('Todo Application', () => {
  it('loads the page', function () {
    cy.server()
    // Alias the fixture data
    cy.route('/api/todos', [
      {
        id: 3,
        text: 'Hello world',
        completed: false
      },
      {
        id: 4,
        text: 'Goodnight moon',
        completed: true
      }
    ]).as('preload')

    cy.visit('/')
    cy.wait('@preload')

    cy.store('example.test.first').should('equal', 1)

    // Access the fixture data as this.todos
    cy.store('todos').should('deep.equal', this.todos)

    cy.get('[data-cy=todo-item-1]')
      .should('have.text', 'Hello world')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=todo-item-2]')
      .should('have.text', 'Goodnight moon')
      .should('have.class', 'completed')
      .find('.toggle')
      .should('be.checked')
  })
})