import React from 'react';
import { Skeleton, Row, Col, Popconfirm, message, Icon, Tag } from 'antd';
import { IDataSource } from './collection.config';
import noDataImg from 'assets/images/noData.png';
import { SvgComponent } from 'components/icon/icon';
import { api } from 'common/api/index';
import { ICollectionListsRequest, ICollectionListsResponse, ITeachChapterResList } from 'common/api/api-interface';
import { IPageInfo } from 'components/pagination/index';
import { messageFunc, downloadFile } from 'common/utils/function';
import { sourceFormat, matchFieldFindeTarget, IDictionaryItem } from 'common/dictionary/index';
import { handleMaterialOperation, IPromiseResolve } from 'common/service/material-operation-ajax';
import { defaultBookPic } from 'common/service/img-collection';
import { BrowseFileModalComponent, IBrowseFileModalProps } from 'components/browse-file/browse-file';
import './collection.scss';

interface IColleactionProps {
    [key: string]: any;
}

interface IState {
    dataSource: IDataSource[];
    isLoading: boolean;
    hasData: boolean;
    canScrollLoad: boolean;
    pageInfo: IPageInfo;
    modalVisible: boolean;
    currentViewSource: IDataSource | null;
    [key: string]: any;
}

export default class ColleactionContainer extends React.PureComponent<IColleactionProps, IState> {
    constructor(public props: IColleactionProps) {
        super(props);

        this.state = {
            dataSource: [],
            isLoading: true,
            hasData: false,
            canScrollLoad: true,
            pageInfo: {
                currentPage: 1,
                pageCount: 0,
                pageSize: 10,
                rowCount: 0,
                totalCount: 0,
                pageSizeOptions:['10', '20', '30', '40', '50']
            },
            modalVisible: false,
            currentViewSource: null
        };
    }

    public componentDidMount() {
        const params: ICollectionListsRequest = {
            pageInfo: {
                pageSize: 10,
                pageNum: 1
            }
        };

        this.loadColleaction(params);
    }

    public loadColleaction = (params: ICollectionListsRequest) => {
        const loading = messageFunc();

        this.setState({
            isLoading: true
        });

        api.collectionList(params).then((res: ICollectionListsResponse) => {
            let state = {};

            if (res.status === 200 && res.data.success) {
                const { hasNextPage, list, pageNum } = res.data.result.teachChapterList;
                const dataSource: IDataSource[] = list.map((item: ITeachChapterResList) => {
                    const typeImg: IDictionaryItem = matchFieldFindeTarget(sourceFormat, { value: String(item.fileFormat) })!;

                    return {
                        size: item.size,
                        title: item.name,
                        desc: item.desc,
                        url: item.link,
                        type: item.fileType,
                        typeImg: typeImg ? typeImg.src : '',
                        fileFormat: item.fileFormat,
                        id: item.id,
                        isCollect: true,
                        chapterId: item.chapterId,
                        coverLink: item.coverLink || defaultBookPic
                    };
                });

                const { pageInfo } = this.state;
                state = {
                    dataSource,
                    hasData: dataSource.length > 0,
                    canScrollLoad: hasNextPage,
                    ...hasNextPage && {...pageInfo, pageNum }
                };

                loading.success('加载完成');
            } else {
                state = {
                    dataSource: [],
                    hasData: false,
                    canScrollLoad: false
                };

                loading.error(res.data.desc);
            }

            this.setState({
                ...state,
                isLoading: false
            });
        });
    }

    /** 
     * @callback
     * @desc 加载等多
     */
    public loadMore = () => {
        const { currentPage, pageSize } = this.state.pageInfo;
        const params: ICollectionListsRequest = {
            pageInfo: {
                pageSize: pageSize,
                pageNum: currentPage + 1
            }
        };

        this.loadColleaction(params);
    };

    /** 
     * @callback
     * @desc  取消收藏
     */
    public cancelCollection = (source: IDataSource, index: number) => {
        handleMaterialOperation({ operation: 'collect', sourceItem: source }).then(({ bool, desc }: IPromiseResolve) => {
            if (bool) {
                const { dataSource } = this.state;
                dataSource.splice(index, 1);

                this.setState({
                    dataSource: [...dataSource]
                });

                message.success(desc,1);
            } else {
                message.error(desc,1);
            }
        });
    }

    /** 
     * @func
     * @desc 查看item 
     */
    public lookItem = (source: IDataSource) => {
        this.setState({
            currentViewSource: source,
            modalVisible: true
        });
        handleMaterialOperation({ operation: 'see', sourceItem: source });
    }

    /** 
     * @callback
     * @desc 下载收藏
     */
    public downloadCollection = (source: IDataSource) => {
        downloadFile({ fileName: source.title, fileFormat: source.fileFormat, url: source.url });
        handleMaterialOperation({ operation: 'download', sourceItem: source })
    }

    /** 
     * @func
     * @desc 构建骨架屏
     */
    public buildSkeleton = (num: number = 3): React.ReactNode => {
        return <Row className='skeleton-box' gutter={24}>
            {
                Array.apply(null, Array(num)).map((x, i: number) => {
                    return <Col className='skeleton-col' key={`skeleton-col-${i}`} xs={{span: 12}} sm={{span: 8}} lg={{span: 6}}>
                                <Skeleton active/>
                            </Col>
                })
            }
        </Row>
    }

    public handleModalOk = () => {
        this.setState({
            modalVisible: false
        });
    }

    public handleModalCancel = () => {
        this.setState({
            modalVisible: false
        });
    }

    public render() {
        const { hasData, dataSource = [], isLoading, canScrollLoad, currentViewSource, modalVisible } = this.state;
        const skeleton: React.ReactNode = this.buildSkeleton();
        const browseFileModalProps: IBrowseFileModalProps = {
            handleOkCallBack: this.handleModalOk,
            handleCancelCallBack: this.handleModalCancel,
            modalVisible,
            source: currentViewSource,
            title: '',
            ...currentViewSource && {
                title: currentViewSource.title,
            }
        };

        return (
            <div className='colleaction-container animateCss'>
                {
                    isLoading ? skeleton : hasData ? <div>
                        <Row gutter={24}>
                            {
                                dataSource.map((source: IDataSource, index: number) => {
                                    return <Col xs={{span: 12}} sm={{span: 8}} lg={{span: 6}} key={`${source.id}-${index}`}>
                                                <div className='collection-item'>
                                                    <div className='collection-item-top' onClick={() => this.lookItem(source)}>
                                                        <label>{source.title}</label>
                                                        { source.typeImg && <img alt='file-format-logo' className='file-format-logo' src={source.typeImg}/> }

                                                        <p className='collection-item-target'><Tag color='red'>教学目标</Tag>{source.desc}</p>
                                                        <p className='collection-item-size'><Tag color='red'>文件大小</Tag>{source.size}</p>
                                                    </div>
                                                    <div className='collection-item-animate'>
                                                        <div className='collection-item-info'>
                                                            <img className='material-cover' alt='书封面' src={source.coverLink}/>
                                                        </div>
                                                        <div className='collection-item-operation'>
                                                            <Row>
                                                                <Col span={8}>
                                                                    <span className='hover-span see-btn' onClick={() => this.lookItem(source)}><SvgComponent className='icon-svg' type='icon-see'/></span>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <span className='hover-span download-btn' onClick={() => this.downloadCollection(source)}><Icon type="cloud-download" /></span>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Popconfirm title='确认要取消收藏吗?' onConfirm={() => this.cancelCollection(source, index)} okText='确认' cancelText='取消'>
                                                                        <span className='hover-span disCollect-btn'><SvgComponent className='svg-component' type='icon-love_fill' /></span>
                                                                    </Popconfirm>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                })
                            }
                        </Row>
                    </div> : 
                    <div className='no-data'>
                        <img alt='无数据' src={noDataImg} />
                        <p>您暂时还没有收藏记录，选择您喜欢的课程并收藏吧！</p>
                    </div>
                }
                { modalVisible && <BrowseFileModalComponent {...browseFileModalProps}/> }
                <div className='colleaction-bottom'>
                    { canScrollLoad && <p className='can-load-more' onClick={this.loadMore}>加载更多...</p> }
                    { hasData && !canScrollLoad && <p className='can-not-load'>------------------------------------------------------------------我是有底线的------------------------------------------------------------------</p> }
                </div>
            </div>
        )
    }
}
