import { Entity } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

class TestEntity extends Entity {
    constructor() {
        super(0, 'test');
    }
    initialize(): void {}
}

export class TestComponent extends Component {
    public testProperty: number = 5;
    constructor() {
        super('TEST');
        this.testProperty = 5;
    }
    testMethod() {
        return this.testProperty;
    }
}

describe('Entity', function() {
    let testEntity;
    beforeEach('Creates entity ', (done) => {
        testEntity = new TestEntity();
        done();
    });
    describe('entity.addComponent', () => {
        it('Adds all the components methods to the entity', (done) => {
            testEntity.addComponent(new TestComponent());
            assert.ok(testEntity.testMethod);
            assert.strictEqual(testEntity.testMethod(), 5);
            assert.strictEqual(Object.keys(testEntity.methodsFromComponent).length, 1);
            assert.strictEqual(Object.keys(testEntity.components).length, 1);
            done();
        });
        it('Adds the entityId to the test component', () => {
            const component = new TestComponent();
            testEntity.addComponent(component);
            assert.strictEqual(component.entityId, testEntity.id);
        });
        it('throws an error if we try adding duplicate components', (done) => {
            testEntity.addComponent(new TestComponent());
            assert.throws(() => {    testEntity.addComponent(new TestComponent()); });
            done();
        })
    });
    describe('entity.removeComponent', () => {
        it('succesfully removes component and its methods from entity', (done) => {
            testEntity.addComponent(new TestComponent());
            testEntity.removeComponent('TEST');
            assert.ok(!('testMethod' in testEntity));
            assert.strictEqual(Object.keys(testEntity.methodsFromComponent).length, 0);
            assert.strictEqual(Object.keys(testEntity.components).length, 0);
            done();
        });
    });
    describe('entity.destroy()', () => {
        it('calls remove method on all components', (done) => {
            let component = new TestComponent();
            let onAddedSpy = sinon.spy(component, 'onAdded');
            let onRemovedSpy = sinon.spy(component, 'onRemoved');

            testEntity.addComponent(component);
            testEntity.destroy();

            sinon.assert.calledOnce(onAddedSpy);
            sinon.assert.calledOnce(onRemovedSpy);
            done();
        });
    });
    describe('entity.getAttributes()', () => {
        it('gets attributes from components using setAttribute', (done) => {
            let component = new TestComponent();
            testEntity.addComponent(component);
            component.setAttribute("test_key", "test_value");
            const attributes = testEntity.getAttributes();
            assert.deepStrictEqual(attributes, { "test_key": "test_value"});
            done();
        });
        it("gets attributes from components using setAttributeGetter", (done) => {
            let component = new TestComponent();
            testEntity.addComponent(component);
            component.setAttributeGetter("test_key", () => {
                return "test_value"
            });
            const attributes = testEntity.getAttributes();
            assert.deepStrictEqual(attributes, { "test_key": "test_value"});
            done();
        })
    })
});
