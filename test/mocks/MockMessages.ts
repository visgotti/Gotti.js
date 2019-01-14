import { MockSystemNames } from './';
export const Messages = [
    {
        type: 'MOCK_FROM_1_TO_ALL',
        data: {
            'foo': 'bar'
        },
        to: MockSystemNames,
        from: MockSystemNames[0],
    },
    {
        type: 'MOCK_FROM_1_TO_2',
        data: {
            'foo': 'bar'
        },
        to: [MockSystemNames[1]],
        from: MockSystemNames[0],
    }
];