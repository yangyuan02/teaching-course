export interface IFormItem {
    label: string;
    placeholder: string;
    controlName: string;
    controlType: string;
    rules: any[];
    key: string;
    state: string;
}

export const formItems: IFormItem[] = [
    {
        label: '旧密码',
        placeholder: '请输入原密码（初次设置时可留空）',
        controlName: 'input',
        controlType: 'password',
        rules: [
            {
                required: true,
                message: '输入原密码',
            }
        ],
        key: '1',
        state: 'oldPwd',
    },
    {
        label: '新密码',
        placeholder: '请输入新密码',
        controlName: 'input',
        controlType: 'password',
        rules: [
            {
                required: true,
                message: '请输入新密码',
            }
        ],
        key: '2',
        state: 'newPwd',
    },
    {
        label: '确认新密码',
        placeholder: '确认新密码',
        controlName: 'input',
        controlType: 'password',
        rules: [
            {
                required: true,
                message: '请输入新密码',
            }
        ],
        key: '3',
        state: 'secondNewPwd',
    }
];
