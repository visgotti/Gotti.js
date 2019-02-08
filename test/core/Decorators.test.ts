import { Entity } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';

import { decorators } from '../../src/core/Decorators';

import { createDummyClientSystem } from '../mocks';

import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';

describe('Decorators', function() {
    let mockSystem1;
    before(() => {
       decorators.restore();
    });
    it('initializes the SystemComponent decorator', (done) => {
        mockSystem1 = createDummyClientSystem('TEST');
        let systems = { 'TEST': mockSystem1 };

        assert.ok(decorators.SystemComponent === null);

        // initialize the decorator this would normally be done in the process.
        decorators.initializeSystemComponentDecorator(systems);
        assert.ok(decorators.SystemComponent !== null);
        done();
    });
    it('creates a decorated component', (done) => {
        @decorators.SystemComponent('TEST')
        class TestComponent extends Component {
            constructor() {
                super('TEST')
            }
        }
        const component = new TestComponent();
        assert.ok(component);
        done();
    });

    it('calls the onComponentAdded method of system', (done) => {
        let mockEntity: any = {};

        let onComponentAddedSpy = sinon.spy(mockSystem1, 'onComponentAdded');

        @decorators.SystemComponent('TEST')
        class TestComponent extends Component {
            constructor() {
                super('TEST')
            }
        }
        const component = new TestComponent();
        component.onAdded(mockEntity);
        sinon.assert.calledOnce(onComponentAddedSpy);
        done();
    });

    it('calls the onComponentRemoved method of system', (done) => {
        let mockEntity: any = {};

        let onComponentRemovedSpy = sinon.spy(mockSystem1, 'onComponentRemoved');

        @decorators.SystemComponent('TEST')
        class TestComponent extends Component {
            constructor() {
                super('TEST')
            }
        }

        const component = new TestComponent();
        component.onRemoved(mockEntity);
        sinon.assert.calledOnce(onComponentRemovedSpy);
        done();
    });
});