import { system_names } from '../';
export const Messages = [
    {
        type: 'MOCK_FROM_1_TO_ALL',
        data: {
            'foo': 'bar'
        },
        to: system_names,
        from: system_names[0],
    },
    {
        type: 'MOCK_FROM_1_TO_2',
        data: {
            'foo': 'bar'
        },
        to: [system_names[1]],
        from: system_names[0],
    }
];