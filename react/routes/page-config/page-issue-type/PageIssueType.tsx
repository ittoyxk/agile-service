import React, {
  useState, useEffect, useReducer, useCallback,
} from 'react';
import {
  TabPage as Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import { Button, Modal, Spin } from 'choerodon-ui/pro/lib';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import WYSIWYGEditor from '@/components/WYSIWYGEditor';
import { observer, useObservable, Observer } from 'mobx-react-lite';
import { Prompt } from 'react-router-dom';
import { pageConfigApi, PageConfigIssueType, IFiledProps } from '@/api/PageConfig';
import { beforeTextUpload, text2Delta } from '@/utils/richText';
import { getApplyType, getMenuType } from '@/utils/common';
import styles from './index.less';
import IssueTypeWrap from './components/issue-type-wrap';
import SortTable from './components/sort-table';
import openAddField from './components/add-field';
import { usePageIssueTypeStore } from './stores';
import Switch from './components/switch';
import './PageIssueType.less';
import CreateField from '../components/create-field';
import { PageIssueTypeStoreStatusCode, PageIFieldPostDataProps } from './stores/PageIssueTypeStore';
import { IFieldPostDataProps } from '../components/create-field/CreateField';

interface DescriptionState {
  id?: string,
  template: string | Array<any>,
  originTemplate: string,
  objectVersionNumber?: number,
}
type DescriptionAction = Required<{ type: string }> & Partial<DescriptionState>

const issueTypeOptions = [
  { value: 'issue_epic', text: '史诗' },
  { value: 'feature', text: '特性' },
  { value: 'story', text: '故事' },
  { value: 'task', text: '任务' },
  { value: 'sub_task', text: '子任务' },
  { value: 'bug', text: '缺陷' },
  { value: 'backlog', text: '需求' },
];
const preCls = 'c7n-agile-page-config-page-issue-type';
function PageIssueType() {
  const {
    sortTableDataSet, addUnselectedDataSet, intl, pageIssueTypeStore,
  } = usePageIssueTypeStore();

  async function handleSubmit() {
    const issueTypeFieldVO = pageIssueTypeStore.getDescriptionObj;

    if (issueTypeFieldVO.dirty
      || pageIssueTypeStore.dataStatusCode !== PageIssueTypeStoreStatusCode.null) {
      pageIssueTypeStore.setLoading(true);
      let submitData: Array<any> = [];
      if (sortTableDataSet.dirty) {
        submitData = sortTableDataSet.filter((record) => record.dirty && !record.get('local'));// &&
      }
      // console.log(sortTableDataSet.dirty, 'submitData', submitData);
      // return true;
      const data = {
        issueType: pageIssueTypeStore.currentIssueType,
        // fields: submitData,
        fields: submitData.map((item) => ({
          fieldId: item.get('fieldId'),
          required: item.get('required'),
          created: item.get('created'),
          edited: item.get('edited'),
          rank: item.get('rank'),
          objectVersionNumber: item.get('objectVersionNumber'),
        })),
        issueTypeFieldVO: issueTypeFieldVO.dirty ? {
          id: issueTypeFieldVO.id,
          template: issueTypeFieldVO.template as string,
          objectVersionNumber: issueTypeFieldVO.objectVersionNumber,
        } : undefined,
        addIds: pageIssueTypeStore.getAddIds,
        createdFields: pageIssueTypeStore.getCreatedFields,
        deleteIds: pageIssueTypeStore.getDeleteIds,
      };
      if (issueTypeFieldVO.dirty) {
        beforeTextUpload(text2Delta(issueTypeFieldVO.template), data.issueTypeFieldVO!, () => {
          pageConfigApi.update(data).then(() => {
            pageIssueTypeStore.loadData();
          });
        }, 'template');
      } else {
        pageConfigApi.update(data).then(() => {
          pageIssueTypeStore.loadData();
        });
      }
    }
    return true;
  }
  // 加载全部字段 用于增添已有字段
  useEffect(() => {
    pageIssueTypeStore.loadAllField();
  }, []);

  useEffect(() => {
    pageIssueTypeStore.loadData();
  }, [pageIssueTypeStore.currentIssueType]);

  const handleSelectBox = (val: any) => {
    console.log('code:', pageIssueTypeStore.getDataStatusCode);
    if (pageIssueTypeStore.getDataStatusCode !== PageIssueTypeStoreStatusCode.null
      || pageIssueTypeStore.getDescriptionObj.dirty) {
      Modal.confirm({
        title: '是否放弃更改？',
        children: (
          <div>
            页面有未保存的内容，切换则放弃更改
          </div>
        ),
        onOk: () => pageIssueTypeStore.setCurrentIssueType(val as PageConfigIssueType),
      });
      return false;
    }
    // console.log('lo lo', pageIssueTypeStore.getDataStatusCode);
    pageIssueTypeStore.setCurrentIssueType(val as PageConfigIssueType);
    return true;
  };
  const handleChangeDes = (val: string) => {
    pageIssueTypeStore.changeTemplate(val);
  };
  const handleDeleteFiled = async (data: IFiledProps &
    PageIFieldPostDataProps & { id?: string }) => {
    // pageIssueTypeStore.setLoading(true);
    if (data.local) {
      pageIssueTypeStore.deleteLocalField(data.code, data.id);
    } else {
      console.log('data', data);
      pageIssueTypeStore.addDeleteId(data.id);
      pageIssueTypeStore.setDataStatusCode(PageIssueTypeStoreStatusCode.del);
    }
  };
  // 增添已有字段进行本地提交数据
  useEffect(() => {
    const addDataLength = pageIssueTypeStore.addIds.length
      + pageIssueTypeStore.createdFields.length;
    if (addDataLength === 0
      && pageIssueTypeStore.getDataStatusCode === PageIssueTypeStoreStatusCode.add) {
      pageIssueTypeStore.setDataStatusCode(PageIssueTypeStoreStatusCode.null);
    }
  }, [pageIssueTypeStore.addIds.length, pageIssueTypeStore.createdFields.length]);

  /**
   * 本地提交
   * @param data 本地所需数据
   * @param oldField 是否是已有字段
   */
  const onSubmitLocal = async (data: IFieldPostDataProps, oldField: boolean = false) => {
    const newData = Object.assign(data, {
      local: true,
      fieldName: data.name,
      edited: true,
      created: true,
      required: false,
      rank: undefined, // 需要修改
    });
    pageIssueTypeStore.setDataStatusCode(PageIssueTypeStoreStatusCode.add);
    !oldField && pageIssueTypeStore.addCreatedField(newData);
    // 当是增添的已有字段 或是当前类型字段时 增添数据至表格
    if (oldField
      || (newData.context.some((item: any) => item === 'global' || item === pageIssueTypeStore.currentIssueType))) {
      const newRank = await pageConfigApi.loadRankValue({
        before: false,
        previousRank: sortTableDataSet.data[sortTableDataSet.length - 1].get('rank'),
        nextRank: null,
        issueType: pageIssueTypeStore.currentIssueType,
      });
      newData.rank = newRank;
      sortTableDataSet.create(newData);
    }
    return true;
  };
  const checkCodeOrName = (key: string,
    name: string) => pageIssueTypeStore.getCreatedFields.length !== 0
    // @ts-ignore
    && pageIssueTypeStore.getCreatedFields.some((item) => item[key].trim() === name);
  function openCreateFieldModal() {
    const values = {
      formatMessage: intl.formatMessage,
      schemeCode: 'agile_issue',
      onSubmitLocal,
      defaultContext: [pageIssueTypeStore.getCurrentIssueType],
      localCheckCode: async (str: string) => !!checkCodeOrName('code', str),
      localCheckName: async (str: string) => !!checkCodeOrName('name', str),
    };
    Modal.open({
      key: Modal.key('create'),
      title: intl.formatMessage({ id: 'field.create' }),
      drawer: true,
      children: <CreateField {...values} />,
      style: { width: 740 },
      okText: intl.formatMessage({ id: 'save' }),
      cancelText: intl.formatMessage({ id: 'cancel' }),
    });
  }

  return (
    <Page
      service={
        getMenuType() !== 'project' ? ['choerodon.code.organization.setting.issue.page.ps.scheme']
          : ['choerodon.code.project.setting.page.ps.scheme']
      }
    >
      <Prompt message="页面有未保存的内容，切换则放弃更改" when={sortTableDataSet.dirty} />
      <Header>

        <Button icon="playlist_add" onClick={openCreateFieldModal}>创建字段</Button>
        <Button
          icon="add"
          onClick={() => {
            openAddField(addUnselectedDataSet, pageIssueTypeStore, onSubmitLocal);
          }}
        >
          添加已有字段

        </Button>

      </Header>
      <Breadcrumb />
      <Content className={`${preCls}-content`} style={{ overflowY: 'hidden' }}>
        <Switch
          defaultValue="feature"
          value={pageIssueTypeStore.currentIssueType}
          options={issueTypeOptions}
          onChange={handleSelectBox}
        />
        <Spin spinning={pageIssueTypeStore.getLoading}>
          <div className={styles.top}>
            <IssueTypeWrap title="字段配置">
              <SortTable
                onDelete={handleDeleteFiled}
              />
            </IssueTypeWrap>
            <IssueTypeWrap title="描述信息格式">
              {
                !pageIssueTypeStore.getLoading ? (
                  <WYSIWYGEditor
                    style={{ height: '100%', width: '100%' }}
                    onChange={handleChangeDes}
                    defaultValue={text2Delta(pageIssueTypeStore.descriptionObj.originTemplate)}
                    placeholder="您可以在此自定义描述信息格式"
                  />
                ) : ''
              }

            </IssueTypeWrap>
          </div>
        </Spin>

        <div className={styles.bottom}>
          <Button
            funcType={'raised' as FuncType}
            color={'primary' as ButtonColor}
            onClick={handleSubmit}
          >
            确定
          </Button>
          <Button
            funcType={'raised' as FuncType}
            onClick={pageIssueTypeStore.loadData}
          >
            取消
          </Button>

        </div>

      </Content>
    </Page>
  );
}
export default observer(PageIssueType);
