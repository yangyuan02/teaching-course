import { IQueryPersonDataResult } from 'common/api/api-interface';

export interface IUserModifyStepSecondProps {
    userInfo: IQueryPersonDataResult;
    eventEmitterFunc: Function;
    [key: string]: any;
}

export interface IFormItem {
    label: string;
    placeholder: string;
    controlName: string;
    controlType: string;
    rules?: any[];
    key: string;
    state: string;
}

export const formItem: IFormItem[] = [
    {
        label: '用户名',
        placeholder: '请输入账号',
        controlName: 'input',
        controlType: 'text',
        key: '1',
        state: 'userName',
    },
    {
        label: '职位',
        placeholder: '请输入职位',
        controlName: 'input',
        controlType: 'text',
        key: '2',
        state: 'position',
    },
    {
        label: '个人介绍',
        placeholder: '请输入个人介绍',
        controlName: 'input',
        controlType: 'text',
        key: '3',
        state: 'desc',
    },
];

export interface IValue {
    userName: string;
    position: string;
    desc: string;
}
