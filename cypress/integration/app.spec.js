context("Full end-to-end testing", function() {
  it("loads todos", function() {
    cy.server()
    cy.seed({todos: [{'text': "Hello World"}, {'text': 'Goodnight Moon', completed: true}]})
    cy.route('GET', '/api/todos').as('preload')
    cy.visit("/");
    cy.wait('@preload')

    cy.store('todos').then((todos) => { return todos.length; }).should('equal', 2)

    cy.get('[data-cy=todo-list]').children().should('have.length', 2)

    cy.get('[data-cy=todo-item-1]')
      .should('have.text', 'Hello World')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=todo-item-2]')
      .should('have.text', 'Goodnight Moon')
      .should('have.class', 'completed')
      .find('.toggle')
      .should('be.checked')
  });

  it("creates todos and edits todos", function() {
    cy.server()
    cy.route('GET', '/api/todos').as('preload')
    cy.visit("/");
    cy.wait('@preload')

    // We seeded an empty DB
    cy.store('todos').its('length').should('equal', 0)

    cy.get('[data-cy=todo-list]').children().should('have.length', 0)

    // Create first todo
    cy.route({
      method: "POST",
      url: "/api/todos"
    }).as("createTodo");

    cy.get('.new-todo').type('1st Todo{enter}')

    cy.wait('@createTodo')

    // Frontend has 1 todo now
    cy.store('todos').its('length').should('equal', 1)

    cy.get('[data-cy=todo-list]').children().should('have.length', 1)

    // Create 2nd todo
    cy.route({
      method: "POST",
      url: "/api/todos"
    }).as("createTodo2");

    cy.get('.new-todo').type('2nd Todo{enter}')

    cy.wait('@createTodo2')

    // Test that store matches
    cy.store('todos').its('length').should('equal', 2)

    cy.get('[data-cy=todo-list]').children().should('have.length', 2)

    cy.get('[data-cy=todo-item-1]')
      .should('have.text', '1st Todo')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=todo-item-2]')
      .should('have.text', '2nd Todo')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    // Update title of first todo
    cy.route({
      method: "PUT",
      url: "/api/todos/1"
    }).as("updateTodo1");

    cy.get('[data-cy=todo-label-1]').dblclick()
    cy.get('[data-cy=todo-input-edit]').clear().type('First Todo Is Different{enter}')

    cy.wait('@updateTodo1')

    cy.get('[data-cy=todo-item-1]')
      .should('have.text', 'First Todo Is Different')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=todo-item-2]')
      .should('have.text', '2nd Todo')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    // Check completed for 2nd todo
    cy.route({
      method: "PUT",
      url: "/api/todos/2"
    }).as("updateTodo2");

    cy.get('[data-cy=todo-item-2] > .view > .toggle').click()

    cy.wait('@updateTodo2')

    cy.get('[data-cy=todo-item-1]')
      .should('have.text', 'First Todo Is Different')
      .should('not.have.class', 'completed')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=todo-item-2]')
      .should('have.text', '2nd Todo')
      .should('have.class', 'completed')
      .find('.toggle')
      .should('be.checked')

    // Destroy a Todo
    cy.route({
      method: "DELETE",
      url: "/api/todos/1"
    }).as("destroyTodo");

    cy.get('[data-cy=destroy-todo-1]').invoke('show').should('be.visible').click()

    cy.wait('@destroyTodo')

    cy.store('todos').its('length').should('equal', 1)

    cy.get('[data-cy=todo-list]').children().should('have.length', 1)

    // Create 3rd and 4th todos
    cy.route({
      method: "POST",
      url: "/api/todos"
    }).as("createTodo3");

    cy.get('.new-todo').type('3rd Todo{enter}')

    cy.wait('@createTodo3')

    cy.route({
      method: "POST",
      url: "/api/todos"
    }).as("createTodo4");

    cy.get('.new-todo').type('4th Todo{enter}')

    cy.wait('@createTodo4')

    cy.route({
      method: "PUT",
      url: "api/todos/bulk_update"
    }).as('toggleAll');

    cy.get('[data-cy=toggle-all]').click()

    cy.wait('@toggleAll')

    cy.get('[data-cy=todo-item-2]')
      .find('.toggle')
      .should('be.checked')

    cy.get('[data-cy=todo-item-3]')
      .find('.toggle')
      .should('be.checked')

    cy.get('[data-cy=todo-item-4]')
      .find('.toggle')
      .should('be.checked')

    cy.store('todos').lo_map((todo) => { return todo.completed; }).should('deep.equal', [true, true, true])

    cy.route({
      method: "PUT",
      url: "/api/todos/2"
    }).as("toggleTodo");

    cy.get('[data-cy=todo-item-2] > .view > .toggle').click()

    cy.wait('@toggleTodo')

    cy.get('[data-cy=todo-item-2]')
      .find('.toggle')
      .should('not.be.checked')

    cy.get('[data-cy=filter-show_active]').click()

    cy.get('[data-cy=todo-item-2]').should('be.visible')
    cy.get('[data-cy=todo-item-3]').should('not.be.visible')
    cy.get('[data-cy=todo-item-4]').should('not.be.visible')

    cy.get('[data-cy=filter-show_completed]').click()

    cy.get('[data-cy=todo-item-2]').should('not.be.visible')
    cy.get('[data-cy=todo-item-3]').should('be.visible')
    cy.get('[data-cy=todo-item-4]').should('be.visible')

    cy.get('[data-cy=filter-show_all]').click()

    cy.get('[data-cy=todo-item-2]').should('be.visible')
    cy.get('[data-cy=todo-item-3]').should('be.visible')
    cy.get('[data-cy=todo-item-4]').should('be.visible')

    // Bulk delete
    cy.route({
      method: "POST",
      url: "/api/todos/bulk_delete"
    }).as("clearCompleted");

    cy.get('[data-cy=clear-completed]').click()

    cy.wait('@clearCompleted').then((xhr) => {
      cy.wrap(xhr.request.body).should('deep.equal', {ids: [3,4]})
      cy.wrap(xhr.status).should('equal', 200)
    })
  });
});