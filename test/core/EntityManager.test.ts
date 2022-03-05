import { Entity } from '../../src/core/Entity';
import { EntityManager } from '../../src/core/EntityManager';
import { Component } from '../../src/core/Component';
import ClientSystem  from '../../src/core/System/ClientSystem';
import System  from '../../src/core/System/System';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

class TestEntity extends Entity {
    constructor() {
        super(0, 'test');
    }
    initialize(): void {
        this.addComponent(new TestComponent());
    }
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

// @ts-ignore
export class TestSystem extends System {
    constructor() {
        super('TEST');
    }
    clear(){}
    initialize(...args: any[]): void {}
    onLocalMessage(message: any): void {}
    update(delta): void {}
}

describe('EntityManager', function() {
    let entityManager;
    let testSystem;
    let entity;
    beforeEach('creates EntityManager entity ', (done) => {
        // @ts-ignore
        testSystem = new TestSystem() as ClientSystem;
        entity = null;
        let systemMap = {'TEST': testSystem};
        entityManager = new EntityManager(systemMap, {});
        done();
    });
    describe('entityManager.initializeEntity', () => {
        it('correctly initializes an entity with the added components', () => {
            entity = entityManager.initializeEntity(new TestEntity());
            assert.strictEqual(entity.id, 0);
            assert.strictEqual(entity.testMethod(), 5);
        });
        it('calls the systems onEntityAddedComponent when initialized', () => {
            let spy = sinon.spy(testSystem, 'onEntityAddedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            sinon.assert.calledOnce(spy);
        });
        it('calls the systems onEntityAddedComponent when you manually add a system at component runtime', () => {
            let spy = sinon.spy(testSystem, 'onEntityAddedComponent');
            entity = new TestEntity();
            entity.initialize = () => {};

            entityManager.initializeEntity(entity);
            // shouldnt have called it yet since we didnt add the component
            sinon.assert.callCount(spy, 0);
            const testComponent = new TestComponent(); // mock out so we dont add component so we can reference it in test
            entity.addComponent(testComponent);
            sinon.assert.calledOnce(spy);
            assert.strictEqual(spy.calledWith(entity, testComponent), true);
        });
    });
    describe('Tests systems helper functions for entity events', () => {
        it('calls the event emitter once and then doesnt after entity is destroyed', () => {
            const testObject = { testMethod: (payload) => true }
            let spy = sinon.spy(testSystem, 'offEntityEvent');
            let testEventSpy = sinon.spy(testObject, 'testMethod');
            entity = entityManager.initializeEntity(new TestEntity());
            testSystem.onEntityEvent(entity, 'test-event', testObject.testMethod);
            entity.emit('test-event', 1);
            sinon.assert.calledOnce(testEventSpy);
            assert.strictEqual(testEventSpy.calledWith(1), true);
            entityManager.destroyEntity(entity);
            sinon.assert.calledOnce(spy);
            entity.emit('test-event', 1);
            // confirm its still only called once.
            sinon.assert.calledOnce(testEventSpy);
        });
        it('adds references to event correctly and removes them when entity is destroyed', () => {
            const testObject = { testMethod: (payload) => true }
            entity = entityManager.initializeEntity(new TestEntity());
            testSystem.onEntityEvent(entity, 'test-event', testObject.testMethod);
            assert.deepStrictEqual(testSystem.entityEventHandlers, {
                [entity.id]: {
                    entity,
                    listeners: {
                        ['test-event']: testObject.testMethod
                    }
                }
            });
            entityManager.destroyEntity(entity);
            // confirm its still only called once.
            assert.deepStrictEqual(testSystem.entityEventHandlers, {});
        });
        it('calls the event emitter once and then doesnt after component is removed from entity is destroyed', () => {
            const testObject = { testMethod: (payload) => true }
            let spy = sinon.spy(testSystem, 'offEntityEvent');
            let testEventSpy = sinon.spy(testObject, 'testMethod');
            entity = entityManager.initializeEntity(new TestEntity());
            testSystem.onEntityEvent(entity, 'test-event', testObject.testMethod);
            entity.emit('test-event', 1);
            sinon.assert.calledOnce(testEventSpy);
            assert.strictEqual(testEventSpy.calledWith(1), true);
            entity.removeComponent('TEST');
            sinon.assert.calledOnce(spy);
            entity.emit('test-event', 1);
            // confirm its still only called once.
            sinon.assert.calledOnce(testEventSpy);
        });
    });
    describe('After initialized, onEntityRemovedComponent is called by entityManager.destroyEntity', () => {
        it('calls onEntityRemovedComponent when called', () => {
            let spy = sinon.spy(testSystem, 'onEntityRemovedComponent');
            let spy2 = sinon.spy(testSystem, '_onEntityRemovedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            entityManager.destroyEntity(entity);
            sinon.assert.calledOnce(spy);
            sinon.assert.calledOnce(spy2);
        });
        it('calls onEntityRemovedComponent with the Entity and Component as params when called', () => {
            let spy = sinon.spy(testSystem, 'onEntityRemovedComponent');
            let spy2 = sinon.spy(testSystem, '_onEntityRemovedComponent');
            const testComponent = new TestComponent(); // mock out so we dont add component so we can reference it in test
            entity = new TestEntity();
            entity.initialize = () => {};
            entity = entityManager.initializeEntity(entity);
            entity.addComponent(testComponent);
            entityManager.destroyEntity(entity);
            sinon.assert.calledOnce(spy);
            sinon.assert.calledOnce(spy2);
            assert.strictEqual(spy.calledWith(entity, testComponent), true);
            assert.strictEqual(spy2.calledWith(entity, testComponent), true);
        });
    });
    describe('After initialized, onEntityRemovedComponent is called by entity.destroy()', () => {
        it('calls onEntityRemovedComponent when called', () => {
            let spy = sinon.spy(testSystem, 'onEntityRemovedComponent');
            entity = entityManager.initializeEntity(new TestEntity());
            entity.destroy();
            sinon.assert.calledOnce(spy);
        });
    });
});
