import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { unionBy } from 'lodash';
import SelectFocusLoad from '@/components/SelectFocusLoad';
import { configTheme } from '@/utils/common';
import SelectFeature from '@/components/select/select-feature';
import { featureApi } from '@/api';
import { getSelectStyle } from '../utils';

let list = [];
function FeatureField({ field, value, onChange }) {
  const [, setValue] = useState(0);
  const defaultValue = useMemo(() => value, []);
  return (
    <SelectFeature
      key={field.code}
      flat
      value={value || []}
      placeholder={field.name}
      multiple
      maxTagCount={3}
      maxTagTextLength={10}
      request={({ filter, page }) => featureApi.queryAllInSubProject(defaultValue, filter, page)}
      dropdownMatchSelectWidth={false}
      clearButton
      onChange={onChange}
    />
  );
  return (
    <SelectFocusLoad
      {...configTheme({
        list,
        textField: 'summary',
        valueFiled: 'issueId',
      })}
      type="feature_all"
      loadWhenMount
      style={getSelectStyle(field, value)}
      mode="multiple"
      showCheckAll={false}
      allowClear
      dropdownMatchSelectWidth={false}
      dropdownStyle={{ maxWidth: 250 }}
      placeholder={field.name}
      saveList={(v) => {
        const shouldRender = list.length === 0 && value && value.length > 0;
        list = unionBy(list, v, 'issueId');
        // 已保存筛选条件含有用户，并且这个时候select并没有显示，那么选了自定义筛选，要渲染一次
        if (list.length > 0 && shouldRender) {
          setValue(Math.random());
        }
      }}
      filter
      onChange={onChange}
      value={value}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      requestArgs={value}
    />
  );
}
export default observer(FeatureField);
