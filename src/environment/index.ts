import loginLogo from 'assets/images/loginLogo.png';
import siderLogo from 'assets/images/siderLogo.png';
import pageLogo from 'assets/images/siderLogo.png';

/** 当前执行环境 */
export type CurrentEnv = 'development' | 'production';

export const currentEnv: CurrentEnv = process.env.BUILD_ENV as CurrentEnv;

/** 环境地址列表 */
export const baseUrlList = {
    development: '',
    production: ''
};

export const env = {
    name: '教学课程资源平台',
    footerText: 'Microspicy-Technology ©2019 Author Microspicy Technology',
    siderLogo,
    loginLogo,
    pageLogo,
    /** 
     * 接口请求
     * 例如：baseURL: 'https://some-domain.com/api/'
     */
    baseURL: baseUrlList[currentEnv],
    /** 
     * @desc 配置svg的url，配合组件(components/icon/icon.tsx)使用
     */
    svgUrl: '//at.alicdn.com/t/font_1531539_c1pidro5o3.js'
};
