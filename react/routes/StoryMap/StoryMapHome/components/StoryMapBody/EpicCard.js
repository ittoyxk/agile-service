import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import StatusTag from '@/components/StatusTag';
import EpicDrag from './EpicDrag';
import StoryMapStore from '../../../../../stores/project/StoryMap/StoryMapStore';
import Card from './Card';
import './EpicCard.less';
import { CardWidth, CardPaddingLeft } from '../../Constants';

@observer
class EpicCard extends Component {
  handleClick = () => {
    const { epic } = this.props;
    if (epic.issueId) {
      StoryMapStore.setClickIssue({ ...epic, epicId: epic.issueId });
    }
  }

  setZIndex = () => {
    this.container.style.zIndex = 9999;
  }

  resetZIndex = () => {
    this.container.style.zIndex = 'unset';
  }

  saveRef = (ref) => {
    const { connectDragSource, saveRef } = this.props;
    connectDragSource(ref);
    if (saveRef) {
      saveRef(ref);
    }
    this.container = ref;
  }

  render() {
    const {
      epic, subIssueNum, onMouseDown,
    } = this.props;
    const {
      issueId, epicName, statusVO,
    } = epic;
    const { selectedIssueMap } = StoryMapStore;
    return (
      <Card
        className={`c7nagile-StoryMap-EpicCard minimapCard ${issueId ? '' : 'none'} ${statusVO && statusVO.completed ? 'completedCard' : undefined}  ${selectedIssueMap.has(issueId) ? 'selected' : ''}`}
        style={{ display: 'flex' }}
        onClick={this.handleClick}
        saveRef={this.saveRef}
        onMouseDown={onMouseDown}
      >
        <div className="top">
          <div className="summary">
            <Tooltip title={`${epicName || '无史诗'}`} getPopupContainer={() => document.getElementsByClassName('minimap-container-scroll')[0]}>
              {`${epicName || '无史诗'}`}
            </Tooltip>
          </div>
          <div style={{ marginLeft: 5 }}>{`(${subIssueNum})`}</div>
        </div>
        {
          epicName && (
            <div className="status">
              <StatusTag
                data={statusVO || {}}
              />
            </div>
          )
        }
      </Card>
    );
  }
}

EpicCard.propTypes = {

};

export default EpicDrag(EpicCard);
