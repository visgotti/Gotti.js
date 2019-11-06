export const system_names = ['MOCK_SYSTEM_1', 'MOCK_SYSTEM_2', 'MOCK_SYSTEM_3'];

export { Messages } from './client/messages';

export { createDummyClientSystem } from './client/createDummySystem';
export { createDummyOfflineClientProcess, createDummyNetworkClientProcess } from './client/createDummyProcess';

export const TestPlugin = {
    name: "TestPlugin",
    props() {
        return {
            testString: "test",
            testNumber: 0,
        }
    },
    methods: {
        test() {
            return "test"
        },
        add(number) {
            this.testNumber+=number;
        },
        testEmit() {
            this.emit("test", "testPayload")
        }
    }
}