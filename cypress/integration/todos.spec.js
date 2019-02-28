describe('Todo Application', () => {
  it('loads the page', function () {
    cy.server()

    let todos = [
      {
        "id": 1,
        "text": "Hello world",
        "completed": false
      },
      {
        "id": 2,
        "text": "Goodnight moon",
        "completed": true
      }
    ]

    // Alias the fixture data
    cy.route('/api/todos', todos).as('preload')

    cy.visit('/')
    cy.wait('@preload')

    cy.store('example.test.first').should('equal', 1)

    cy.store('todos').should('deep.equal', todos)

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