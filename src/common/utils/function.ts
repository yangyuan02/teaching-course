/** 
 * @desc 获取token
 */
export function getToken() {
    const token: string = '';
    return token;
}

/**
 * @desc 获取用户基本信息
 */
export function getUserBaseInfo() {
    const userInfo = {
        loginName: '',
        id: ''
    };
    return userInfo;
}

/**
 * @desc 获取屏幕分辨率
 */
export function getScreenInfo() {
    const { offsetHeight, offsetWidth } = document.body;
    return { offsetHeight, offsetWidth }
}

export const isType = (obj: any) => Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
export const isArray = (obj: any) => Array.isArray(obj) || isType(obj) === 'array';
export  const isNullOrUndefined = (obj: any) => obj === null || obj === undefined;

/**
 * @desc 获取图片的base64
 * @param img 
 * @param callback 
 */
export function getBase64(img: Blob, callback: Function) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

/**
 * @desc 节流
 * @param fn 
 * @param time 
 */
// export function throttle(fn: Function, time: number) {
//     // last是上次触发回调的时间
//     let last = 0;

//     // 将throttle处理结果当做函数返回
//     return function() {
//         // 保留调用时的this上下文
//         let context = this;
//         // 传入的参数
//         let args = arguments;
//         // 最新时间
//         let now: number = Date.now();

//         if (now - last >= time) {
//             last = now;
//             fn.apply(this, args);
//         }
//     };
// }

// /**
//  * @desc 去抖动
//  * @param fn 
//  * @param time 
//  */
// export function debounce(fn: Function, time: number) {
//     // 定时器
//     let timer: number;

//     return function() {
//         // 保留调用时的this上下文
//         let context = this;
//         // 传递的参数
//         let args = arguments;

//         // 每次事件被触发时候，都会清除定时器
//         if (timer) {
//             clearTimeout(timer);
//         }

//         timer = setTimeout(function() {
//             fn.apply(context, args);
//         }, time);
//     };
// }