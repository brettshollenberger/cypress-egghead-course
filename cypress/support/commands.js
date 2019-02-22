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
const factories = require('../factories/factories.js')

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

Cypress.Commands.add("seed", (seeds) => {
    let mappedSeeds = _.reduce(seeds, (output, seeds, key) => {
        let factory = factories[key] || undefined;

        if (_.isUndefined(factory)) {
            output[key] = seeds;
        } else {
            output[key] = seeds.map((seed) => {
                let mapped = _.cloneDeep(seed);
                let factoryOverrides = new factory().build();

                return _.defaults(mapped, factoryOverrides);
            })
        }

        return output;
    }, {});

    cy.task('db:seed', mappedSeeds)
})

Cypress.Commands.add("resetSeeds", () => {
    _.each(factories, (factory, unused) => {
        _.each(factory, (val, unused) => {
            if (_.isFunction(val.reset)) {
                val.reset();
            }

        })
    })
    return true;
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

Cypress.Commands.add("map", {prevSubject: true}, (subject, fn) => {
    return _.map(subject, fn);
})

beforeEach(() => {
    cy.resetSeeds();
})