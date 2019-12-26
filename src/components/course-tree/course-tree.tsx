import * as React from 'react';
import { Tree, Skeleton } from 'antd';
import { IMenuItem } from 'containers/user/book/directory/index.config';
import { SvgComponent } from 'components/icon/icon';
import { loadMaterialMenu, loadSectionList, matchOutermostLayerKey } from 'common/service/tree-ajax';
import { messageFunc } from 'common/utils/function';
import { ITeachChapterList } from 'common/api/api-interface';
import './course-tree.scss';

export interface ICourseTreeProps {
    handleClick: Function;
    [key: string]: any;
}

interface ICommon {
    [key: string]: any;
}

interface IState {
    menus: Array<IMenuItem>;
    isLoading: boolean;
    hasData: boolean;
}

interface ITreeModalConfig extends ICommon {
    currentNode: any;
}

export interface courseTreeResponse {
    showList: ITeachChapterList[];
    breadcrumb: string[],
    isLoading: string;
}

const { TreeNode } = Tree;

export class CourseTreeContainer extends React.PureComponent<ICourseTreeProps, IState> {
    public config:ITreeModalConfig;

    constructor(public props: ICourseTreeProps) {
        super(props);

        this.state = {
            menus: [],
            isLoading: false,
            hasData: false
        };

        this.config = {
            currentNode: null
        };
    }

    public componentDidMount() {
        this.loadFirstLayerMenu();
    }

    /** 
     * @func
     * @desc 加载最外层级目录菜单
     */
    public loadFirstLayerMenu = () => {
        const loading = messageFunc();

        this.setState({
            isLoading: true
        });

        loadMaterialMenu().then((res: IMenuItem[]) => {
            let state = {
                isLoading: false
            };
            
            res.length && (state = {...state, ...{
                menus: res.map((item) => {
                    item.loaded = false;
                    return item;
                }),
                hasData: res.length > 0
            }});

            this.setState({
                ...state
            });

            loading.success();
        });
    }

    /**
     * @callback
     * @desc 加载课程章节
     */
    public handleTreeNodeLoad = (treeNode: any): Promise<any> => {
        return new Promise((resolve) => {
            if (treeNode.props.children) {
                resolve();
                return;
            }

            const loading = messageFunc(); 
            this.props.handleClick({ isLoading: 'true' });
            const params: FormData = new FormData();
            const materialID: string = treeNode.props.dataRef.value;
            params.set('id', materialID);

            loadSectionList(params, treeNode, this.state.menus).then(({ menusState, showList }) => {
                menusState.length && this.setState({
                    menus: menusState.map((item: IMenuItem) => {
                        item.value === materialID && (item.loaded = true);
                        return item;
                    })
                });
                loading.success();
                this.pushChapterMaterial(`${treeNode.props.dataRef.value}-0`, menusState);
                resolve();
            }, (reject: string) => {
                loading.warn(reject);
                this.props.handleClick({ isLoading: 'false' });
                resolve();
            });
        });
    }

    /**
     * @func
     * @desc 推送相关的节点对应的章节材料
     * @param selectedKeys 该参数的结构为：materialId-章节的index-章节的id
     * @param otherParmas 
     */
    public pushChapterMaterial = (selectedKeys: string, stateMenus: IMenuItem[], e?: any) => {
        const keysArr: string[] = selectedKeys.split('-');
        const materialID: string = keysArr[0];
        const sectionIndex: number = +keysArr[1];
        const course: IMenuItem = stateMenus.find((menu: IMenuItem) => menu.value === materialID)!;
        const courseChildren = course.children!;

        /** 展示列表 */
        let showList: ITeachChapterList[] = [];
        /** 面包屑 */
        let breadcrumb: string[] = [];

        /** 如果点击的是最外层 */
        if (keysArr[1] === matchOutermostLayerKey) {
            breadcrumb = [course.name];

            /** 判断该课程是否被加载过 */
            if (!course.loaded) {
                const treeNode = e.node;
                return this.handleTreeNodeLoad(treeNode);
            } else {
                /** 如果是已经被加载过了 */
                showList = courseChildren.reduce((cur: ITeachChapterList[], pre: IMenuItem) => {
                    const teachChapterList: ITeachChapterList[] = pre.teachChapterList!;
                    return cur.concat(teachChapterList);
                }, []);
            }
        } else {
            const section =  courseChildren[sectionIndex];
            breadcrumb = [course.name, section.name];
            showList= section.teachChapterList || [];
        }

        /** 重置key */
        showList = showList.map((list: ITeachChapterList) => {
            list.key = list.id;
            return list;
        });

        this.props.handleClick({
            showList,
            breadcrumb,
            isLoading: 'false'
        });
    }

      /** 
     * @callback
     * @desc 选择节点 
     */
    public selectNode = (selectedKeys: string[], e?: any) => {
        if (selectedKeys.length > 0) {
            this.pushChapterMaterial(selectedKeys[0], this.state.menus, e);
        }
    }

    /** 
     * @func
     * @desc 构建教材目录
     */
    public buidlTree = () => {
        const buildTreeNode = (children: IMenuItem[]) => {
            return children.map((child: IMenuItem) => {
                return <TreeNode icon={<SvgComponent className='svg-icon-chapter' type='icon-subway-chapter' />} title={child.name} key={child.key} isLeaf={child.isLeaf} dataRef={child}>
                    { (child.children!).length > 0 && buildTreeNode(child.children!) }
                </TreeNode>
            });
        };

        return <Tree 
                    showLine
                    loadData={this.handleTreeNodeLoad}
                    onSelect={this.selectNode}
                    switcherIcon={<SvgComponent className='svg-icon-course' type='icon-subway'/>}>
                    { buildTreeNode(this.state.menus) }
                </Tree>
    }

    public render() {
        const { isLoading } = this.state;

        return <div className='course-tree-container-box'>
                    <div className='tree-menu'>
                        {
                            isLoading ? <>
                                <Skeleton active/>
                                <Skeleton active/>
                            </> : this.buidlTree()
                        }
                    </div>
                </div>
    }
}
