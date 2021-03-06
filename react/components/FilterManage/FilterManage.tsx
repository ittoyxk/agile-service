import React from 'react';
import { Button } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { stores } from '@choerodon/boot';
import IssueSearchStore from '@/components/issue-search/store';
import FilterItem from './FilterItem';
import './FilterManage.less';

const { HeaderStore } = stores;
interface Props {
  visible: boolean,
  setVisible: Function,
  issueSearchStore: IssueSearchStore,
}
const FilterManage: React.FC<Props> = ({ visible, setVisible, issueSearchStore }) => {
  const { myFilters } = issueSearchStore;
  if (!visible) {
    return null;
  }
  return (
    <div
      className="c7n-filterList"
      style={{ width: 350, top: HeaderStore.announcementClosed ? 50 : 100 }}
    >
      <div className="c7n-filterList-header">
        <span>筛选管理</span>
        <Button
          shape="circle"
          icon="close"
          onClick={() => {
            setVisible(false);
          }}
        />
      </div>
      {
        myFilters && myFilters.length > 0 ? (
          <ul className="c7n-filterList-content">
            {
              myFilters.map((filter) => (
                <FilterItem
                  key={filter.filterId}
                  data={filter}
                  onSubmit={() => {
                    issueSearchStore.loadMyFilterList();
                  }}
                  onDelete={async () => {
                    await issueSearchStore.loadMyFilterList();
                    if (issueSearchStore.myFilters.length === 0) {
                      setVisible(false);
                    }
                  }}
                />
              ))
            }
          </ul>
        ) : <div style={{ textAlign: 'center', marginTop: 15, color: 'rgba(0,0,0,0.65)' }}>暂无数据</div>
      }
    </div>
  );
};
export default observer(FilterManage);
