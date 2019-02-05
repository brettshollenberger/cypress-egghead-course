// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const _ = require('lodash');

Cypress.Commands.add("store", (commands = []) => {
    if (typeof commands == 'string') {
        commands = commands.split(".")
    }
    cy.window().its('store').invoke('getState').then(($store) => {
        return commands.reduce((acc, command) => {
            acc.should('have.ownProperty', command)

            return acc.its(command);
        }, cy.wrap($store))
    })
})

Cypress.Commands.add("filter", { prevSubject: true }, (subject, fn) => {
    return _.filter(subject, fn);
})

Cypress.Commands.add("detect", {prevSubject: true}, (subject, fn) => {
    return _.find(subject, fn);
})

Cypress.Commands.add("pick", {prevSubject: true}, (subject, paths) => {
    return _.pick(subject, paths);
})