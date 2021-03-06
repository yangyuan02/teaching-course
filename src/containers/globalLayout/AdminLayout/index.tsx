import * as React from 'react';
import { env } from 'environment/index';
import {connect} from 'react-redux';
// import { bindActionCreators } from 'redux';
import { Layout, Menu, Icon, Breadcrumb, Popover, BackTop } from 'antd';
import { menu, IMenuItem } from 'common/admin-menu/menu';
import { SvgComponent } from 'components/icon/icon';
import { NavLink } from "react-router-dom";
import './index.scss';
import { cloneDeep } from 'lodash';
import { IAdminLayoutProps, IAdminLayoutState, IConfig, userMenuList, IHeadMenu, userCommonMenuList } from './index.config';
import { localStorageService, getUserBaseInfo } from 'common/utils/function';
import { StorageItemName } from 'common/utils/cache/storageCacheList';
import { loginLogo, simpleLogo, defaultUserPic } from 'common/service/img-collection';

const { SubMenu } = Menu;
const { Header, Sider, Content, Footer } = Layout;

class AdminLayout extends React.Component<IAdminLayoutProps, IAdminLayoutState> {
    public config: IConfig;

    constructor(public props: IAdminLayoutProps) {
        super(props);

        this.config = {
            menuList: cloneDeep(menu),
            userMenuList: cloneDeep(userMenuList),
            userCommonMenuList: cloneDeep(userCommonMenuList),
            teacherCache: getUserBaseInfo()
        };

        this.state = {
            collapsed: false,
            breadcrumb: this.initBreadcrumbInfo()
        };
    }

    public componentDidMount() {
    }

    public initBreadcrumbInfo = (): IMenuItem[] => {
        const pathname: string = window.location.pathname;
        const menuLists: IMenuItem[] = this.config.menuList;
        const result: IMenuItem[] = [];

        for (let i = 0; i < menuLists.length; i++) {
            if (menuLists[i].path.includes(pathname)) {
                result.push(menuLists[i]);
                break;
            }
        }

        return result;
    }

    /**
     * @func
     * @desc 折页开关
     */
    public toggle = () => {
        this.setState({
          collapsed: !this.state.collapsed,
        });
    };

    /** 
     * @func
     * @desc 构建左侧菜单
     */
    public buildMenu = (): React.ReactNode => {
        const mapFunc = (item: IMenuItem) => {
            if (item.children.length > 0) {
                return <SubMenu key={item.key} title={
                            <span>
                                { item.tags && <SvgComponent className={`svg-icon ${item.tags}`} type={item.tags} /> }
                                { item.title }
                            </span>}
                        >
                            {
                                item.children.map((i: IMenuItem) => {
                                    return mapFunc(i);
                                })
                            }
                        </SubMenu>
            } else {
                return <Menu.Item key={item.key} onClick={() => this.updateBreadcrumbInfo(item)}>
                            <NavLink className='link-item' activeClassName='selected' to={item.path}>
                                <SvgComponent className={`svg-icon ${item.tags}`} type={item.tags} />
                                { !this.state.collapsed ? item.title : <span>{item.title}</span>}
                            </NavLink>
                        </Menu.Item>
            }
        }

        return menu.map((item: IMenuItem) => {
            return mapFunc(item);
        });
    }

    /** 
     * @callback
     * @desc 更新面包屑数据
     */
    public updateBreadcrumbInfo = (item: IMenuItem) => {
        const result: IMenuItem[] = [];
        const keys: string[] = item.key.split('-');
        const repeatKeys = (currentMenu: IMenuItem[], keysIndex: number = 0) => {
            const matchKeys: string = keys.slice(0, keysIndex + 1).join('-');
            const target = currentMenu.find((menu: IMenuItem) => menu.key === matchKeys);
            target && (result.push(target));

            if (target && keys.length > keysIndex + 1 && target.children.length > 0) {
                repeatKeys(target.children, keysIndex + 1);
            }
        };

        repeatKeys(this.config.menuList);

        this.setState({
            breadcrumb: result
        });
    }

    /** 
     * @func
     * @desc 构建面包屑
     */
    public reateBreadcrumb = (): React.ReactNode => {
        return <Breadcrumb>
                    {
                        this.state.breadcrumb.map((item: IMenuItem) => {
                            return <Breadcrumb.Item key={item.key}>{ item.title }</Breadcrumb.Item>
                        })
                    }
                </Breadcrumb>
    }

    /** 
     * @func
     * @desc 构建用户下拉菜单
     */
    public buildUserPopMenu = (): React.ReactNode => {
        const { teacherCache } = this.config;

        const content: React.ReactNode = <div className='admin-system-user-menulist'>
            {
                this.config.userMenuList.map((item: IHeadMenu) => {
                    return <li onClick={() => this.handleUserMenuClick(item)} key={item.key}>
                            { item.type === 'SvgComponent' ? <SvgComponent className={`svg-head-user ${item.icon}`} type={item.icon!}/> : <Icon type={item.icon} /> }
                            <span>{item.context}</span>
                        </li>;
                })
            }
        </div>

        return <Popover  content={content} placement='bottomRight' trigger={'click'}>
                    <img alt='user' className='user-portrait' src={teacherCache.link || defaultUserPic} />
                </Popover>
    }

    /** 
     * @func
     * @desc 构建head头部的common快捷菜单按钮
     */
    public buildQuickMenu = (): React.ReactNode => {
        const { userCommonMenuList } = this.config;
        
        return userCommonMenuList.map((item: IHeadMenu) => {
            return <span className='quick-menu-item' onClick={() => this.handleUserMenuClick(item)} key={item.key}>
                        {
                            item.type === 'SvgComponent' ? <SvgComponent className={`svg-head-user ${item.icon}`} type={item.icon!}/> : <Icon type={item.icon} />
                        }
                        <span>{item.context}</span>
                    </span>
        });
    }

    /** 
     * @callback
     * @desc 处理用户菜单点击
     */
    public handleUserMenuClick = (menu: IHeadMenu) => {
        if (menu.value === 'changeAdmin') {
            localStorageService.remove(StorageItemName.BEHINDLOGINCACHE);
            window.location.href = '/admin/login';
        } else if (menu.value === 'exit') {
            Object.keys(StorageItemName).forEach((item: string) => {
                localStorageService.remove(item);
            });
            
            window.location.href = '/user/login';
        } else if (menu.value === 'skip-to-user-system') {
            /** 跳转至前台登录页 */
            localStorageService.set(StorageItemName.PAGETYPE, { type: 'front' });
            window.location.href = '/book';
        }
    }

    public render() {
        const menuList: React.ReactNode = this.buildMenu();
        const bread: React.ReactNode = this.reateBreadcrumb();
        const userOperation: React.ReactNode = this.buildUserPopMenu();
        const quickOperation: React.ReactNode = this.buildQuickMenu();

        return <Layout className='admin-layout'>
                    <Sider style={{
                                overflow: 'auto',
                                height: '100vh',
                            }}
                            className={`slide-coantainer ${this.state.collapsed ? 'collapsed' : ''}`} trigger={null} collapsible collapsed={this.state.collapsed}>
                        <div className='slide-logo-box'>
                            <img className='slide-logo' alt='slide-logo' src={this.state.collapsed ? simpleLogo : loginLogo} />
                        </div>
                        <Menu theme='dark' className='admin-layout-menu' mode='inline' defaultSelectedKeys={['1']}>
                            { menuList }
                        </Menu>
                    </Sider>
                    <Layout>
                        <Header className='admin-head-box' style={{ background: '#fff', padding: 0}}>
                            <div className='head-left-box'>
                                <Icon
                                className='trigger'
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle} />
                                <div className='system-version'>{`${env.name} ${env.version}`}</div>
                            </div>
                            <div className='head-right-box'>
                                <div className='user-operation'>{ userOperation }</div>
                                <div className='menu-list'>{ quickOperation }</div>
                            </div>
                        </Header>
                        <Content>
                            <div className='admin-bread-box'>
                                <SvgComponent className='svg-icon' type='icon-breadcrumb' />
                                { bread }
                            </div>
                            <div className='admin-body' >
                                { this.props.children }
                            </div>
                            <Footer className={`admin-foot ${this.state.collapsed ? 'collapsed' : ''}`} style={{ textAlign: 'center' }}>
                                { env.footerText }
                            </Footer>
                        </Content>
                    </Layout>
                    <BackTop/>
                </Layout>
    }
}

function mapStateToProps() {
    return {};
}

// function mapDispatchToProps(dispatch: any) {
//     return {
//     }
// }

export default connect(
    mapStateToProps
)(AdminLayout);