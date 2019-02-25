describe('Todo Application', () => {
  context('With mocked backend', function () {
    beforeEach(function () {
      cy.fixture('todos/all.json').as('todos')

      cy.server({ force404: true })
      // Alias the fixture data
      cy.route('/api/todos', '@todos').as('preload')

      cy.visit('/')
      cy.wait('@preload')
    })

    it('loads the page', function () {
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

    context('Todo Creation Retries', function () {
      beforeEach(function () {
        cy.route({
          method: "POST",
          url: "/api/todos",
          status: 500,
          response: ""
        }).as("createTodo");

        cy.get('.new-todo').type('3rd Todo{enter}')

        cy.wait('@createTodo')

        cy.route({
          method: 'POST',
          url: '/api/todos',
          status: 500,
          response: "",
        }).as('createTodo2')

        cy.wait('@createTodo2')
      })

      it('retries 3 times', function () {
        cy.route({
          method: 'POST',
          url: '/api/todos',
          status: 200,
          response: {
            id: 3,
            text: '3rd Todo',
            completed: false
          },
        }).as('createTodo3')

        cy.wait('@createTodo3')

        cy.get('[data-cy=todo-list]')
          .children()
          .should('have.length', 3)

        cy.get('[data-cy=todo-item-3]').should('exist')
      })

      it('fails after 3 unsuccessful attempts', function () {
        cy.route({
          method: 'POST',
          url: '/api/todos',
          status: 500,
          response: ''
        }).as('createTodo3')

        cy.wait('@createTodo3')

        cy.get('[data-cy=todo-list]')
          .children()
          .should('have.length', 2)

        cy.get('[data-cy=todo-item-3]').should('not.exist')
      })
    })

    context('Editing Todos', function () {
      it('edits existing todos', function () {
        cy.route('PUT', '/api/todos/1', 'ok', { delay: 20 }).as('update')

        cy.get('[data-cy=todo-label-1]').dblclick()
        cy.get('[data-cy=todo-input-edit]').clear().type('Updated todo{enter}')

        cy.wait('@update')

        cy.store('todos')
          .detect((todo) => { return todo.id == 1; })
          .should('deep.equal', {
            id: 1,
            text: 'Updated todo',
            completed: false
          })
      })

    })

  })

  context('Full end-to-end testing', function() {
    beforeEach(function() {
      cy.visit('/')
    })

    it('performs a hello world', function() {
      cy.task('hello', {name: 'world'})
    })

    it('seeds the database', function() {
      cy.seed({ todos: [{ text: 'Seed the database' }, { completed: true }] })
      cy.visit('/')

      cy.get('[data-cy=todo-item-1]')
        .should('have.text', 'Seed the database')
        .should('not.have.class', 'completed')
        .find('.toggle')
        .should('not.be.checked')

      cy.get('[data-cy=todo-item-2]')
        .should('have.text', 'Hello World 2')
        .should('have.class', 'completed')
        .find('.toggle')
        .should('be.checked')

      cy.get('[data-cy=todo-list]').its('children').its('length').should('equal', 2)
    })

    it("resets between tests", function() { 
      cy.seed({ todos: [{ }, { completed: true }], users: [{}, {email: "whatever@gmail.com"}] })
      cy.visit('/')

      cy.get('[data-cy=todo-item-1]')
        .should('have.text', 'Hello World 1')
        .should('not.have.class', 'completed')
        .find('.toggle')
        .should('not.be.checked')

      cy.get('[data-cy=todo-item-2]')
        .should('have.text', 'Hello World 2')
        .should('have.class', 'completed')
        .find('.toggle')
        .should('be.checked')

      cy.get('[data-cy=todo-list]').its('children').its('length').should('equal', 2)
    })

    it("tests against the db", function() { 
      cy.seed({ todos: [{ }, { completed: true }] })
      cy.visit('/')

      cy.task('db:snapshot', 'todos').should('deep.equal', [
        {
          id: 1,
          text: 'Hello World 1',
          completed: false
        },
        {
          id: 2,
          text: 'Hello World 2',
          completed: true
        },
      ])
    })

    it("tests XHR requests", function() {
      cy.server()
      cy.seed({todos: []})
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
    
      cy.wait('@createTodo').then((xhr) => {
        cy.wrap(xhr.request.body).should('deep.equal', {text: "1st Todo", completed: false})
        cy.wrap(xhr.response.body).should('deep.equal', {id: 1, text: "1st Todo", completed: false})
        cy.wrap(xhr.status).should('equal', 201)
      })
    })

    // Now we're finally going to bring all the pieces of end-to-end testing together to
    // make some full assertions at each level of the stack.
    it.only("creates todos successfully", function() {
      cy.task('db:snapshot', 'todos').should('be.empty')

      cy.server()
      cy.seed({todos: [{text: 'Hello World'}, {text: 'Goodnight Moon'}]})

      let dbSnapshot = [
        {text: "Hello World", id: 1, completed: false},
        {text: "Goodnight Moon", id: 2, completed: false},
      ]

      cy.task('db:snapshot', 'todos').then((seeds) => {
        cy.wrap(seeds).its('length').should('eq', 2)

        cy.wrap(seeds).should('deep.equal', dbSnapshot)
      });

      cy.route('GET', '/api/todos').as('preload')
      cy.visit("/");

      // Before the preload call occurs, no todos are on the page
      cy.store('todos').should('be.empty')

      // We can express this another way, which is to say that our todo-list
      // html list is empty
      cy.get('[data-cy=todo-list]')
        .children()
        .should('have.length', 0)

      // Assert that the API returns the expected data
      cy.wait('@preload').then((xhr) => {
        cy.wrap(xhr.response.body).should('deep.equal', dbSnapshot)
      })

      // Assert that the Redux store has been updated
      cy.store('todos').should('deep.equal', dbSnapshot)

      // Assert that the HTML nodes now exist
      cy.get('[data-cy=todo-list]')
        .children()
        .should('have.length', 2)

      cy.get('[data-cy=todo-item-1]')
        .should('have.text', 'Hello World')
        .should('not.have.class', 'completed')
        .find('.toggle')
        .should('not.be.checked')

      // And assert that their representation reflects the underlying data
      cy.get('[data-cy=todo-item-2]')
        .should('have.text', 'Goodnight Moon')
        .should('not.have.class', 'completed')
        .find('.toggle')
        .should('not.be.checked')

      // We're going to create a new todo
      cy.route({
        method: "POST",
        url: "/api/todos"
      }).as("createTodo");

      // Find the new todo input, and submit a new todo
      cy.get('[data-cy=todo-input-new]').type('3rd Todo{enter}')

      // Assert against our request AND our response
      cy.wait('@createTodo').then((xhr) => {
        cy.wrap(xhr.request.body).should('deep.equal', {text: "3rd Todo", completed: false})
        cy.wrap(xhr.response.body).should('deep.equal', {text: "3rd Todo", completed: false, id: 3})
      })

      // Assert that the database was updated
      cy.task('db:snapshot', 'todos').should('deep.equal', 
        dbSnapshot.concat([{
          id: 3,
          completed: false,
          text: "3rd Todo"
        }])
      )

      // Store reflects successful creation of new todo
      cy.store('todos').its('length').should('equal', 3)

      // UI reflects new element
      cy.get('[data-cy=todo-list]')
        .children()
        .should('have.length', 3)

      cy.get('[data-cy=todo-item-3]')
        .should('have.text', '3rd Todo')
        .should('not.have.class', 'completed')
        .find('.toggle')
        .should('not.be.checked')
    })
  })
})