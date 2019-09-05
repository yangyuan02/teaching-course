import * as React from 'react';
import { env } from 'environment/index';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateSearchBook } from 'store/globalLayout/action';
import { IHeadMenu, headMenus, IConfig, menusContentConfig, IMenusContentConfig } from './index.config';
import { Link } from "react-router-dom";
import './index.scss';
import { Layout, Input, Icon, Popover, Row, Col } from 'antd';
import * as _ from 'lodash';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

type IGlobalLayoutProps = {
    children: any;
    searchBookContent: Function;
    [key: string]: any
}

class GlobalLayout extends React.Component<IGlobalLayoutProps, any> {
    public config: IConfig;
    public childref: any;

    constructor(public props: IGlobalLayoutProps) {
        super(props);

        this.config = {
            headMenus:  _.cloneDeep(headMenus),
            menusContent: this.menusContentList(menusContentConfig),
        };

        this.childref = React.createRef();
    }

    /** 
     * @func
     * @desc 搜索书名
     */
    public searchBook = (e: string) => {
        this.props.searchBookContent(e);
    }

    /** 
     * @func
     * @desc 构建头部菜单
     */
    public buildHeadMenu = (): React.ReactNode  => {
        return <React.Fragment>
                    {
                        this.config.headMenus.map((menu: IHeadMenu) => {
                            const content = this.config.menusContent[menu.value];

                            return <li className='menu-item' key={menu.key}>
                                { menu.type === 'icon' && content && <Popover content={content} trigger={menu.trigger}>
                                        <Icon type={menu.icon} onClick={() => this.clickHeadMenuItem(menu)}/>
                                    </Popover> }
                                { menu.type === 'icon' && !content && <Icon type={menu.icon} onClick={() => this.clickHeadMenuItem(menu)}/> }
                            </li>
                        })
                    }
                </React.Fragment>;
    }

    /** 
     * @func
     * @desc 头部菜单内容
     */
    public menusContentList = (mcg: IMenusContentConfig) => {
        const user: React.ReactNode = <div className='global-container-popover-user'>
            <ul>
                <Row gutter={16}>
                    {
                        mcg.user.map((item: {name: string, value: string, key: string}) => {
                            return <Col key={item.key} xs={{span: 24}} md={{span: 12}}>
                                        <li key={`${item.key}-li`} onClick={() => this.menuOperation(item.value)}>{ item.name }</li>
                                    </Col>
                        })
                    }
                </Row>
            </ul>
        </div>;

        return {
            user
        }
    }

    /** 
     * @func
     * @desc 点击头部菜单
     */
    public clickHeadMenuItem = (menu: IHeadMenu) => {
        if (menu.value === 'upload') {
            this.menuOperation(menu.value);
        }
    }

    /** 
     * @func
     * @desc 跳转
     */
    public menuOperation = (tag: string) => {
        if (tag === 'exit') {
            window.location.href = '/user/login';
        } else if (tag === 'personalSetting') {
            window.location.href = '/setting';
        } else if (tag === 'upload') {
            window.location.href = '/upload';
        }
    }

    public render() {
        const headMenu: React.ReactNode = this.buildHeadMenu();

        return <Layout className='global-layout'>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                    <div className='global-head'>
                        <div className='global-head-left'>
                            <img alt='logo' src={env.pageLogo}/>
                            <Link className='link-item' to='/book'>首页</Link>
                        </div>
                        <div className='global-head-right'>
                            <Search className='search-control' placeholder='搜索教材' onSearch={this.searchBook}/>
                            <ul className='right-menu'>
                                { headMenu }
                            </ul>
                        </div>
                    </div>
                </Header>
                <Content>
                    <div className='global-body' >
                        { this.props.children }
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    { env.footerText }
                </Footer>
            </Layout>
                
    }
}

function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {
        searchBookContent: bindActionCreators(updateSearchBook, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GlobalLayout);