/* eslint-disable react/static-property-placement */
/* eslint-disable max-classes-per-file */
import React, { isValidElement, ReactNode, CSSProperties } from 'react';
import { observer } from 'mobx-react';
import { Icon, Animate } from 'choerodon-ui/pro';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { Select, SelectProps } from 'choerodon-ui/pro/lib/select/Select';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureTextWidth from 'choerodon-ui/pro/lib/_util/measureTextWidth';
import { stopPropagation } from 'choerodon-ui/pro/lib/_util/EventManager';
import './index.less';

const { Option, OptGroup } = Select;

class FlatSelect<T extends SelectProps> extends Select<T> {
  static defaultProps = {
    ...Select.defaultProps,
    dropdownMatchSelectWidth: false,
  };

  // @ts-ignore
  getWrapperClassNames(...args): string {
    const { prefixCls, multiple, range } = this;
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    return super.getWrapperClassNames(
      {
        'flat-select': true,
        [`${prefixCls}-empty`]: this.isEmpty(),
        // @ts-ignore
        [`${prefixCls}-suffix-button`]: isValidElement<{ onClick; }>(suffix),
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-range`]: range,
        // @ts-ignore
        [`${prefixCls}-prefix-button`]: isValidElement<{ onClick; }>(prefix),
      },
      ...args,
    );
  }

  getInnerSpanButton(): ReactNode {
    const {
      props: { clearButton },
      prefixCls,
    } = this;
    if (clearButton && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(
        <Icon type="close" onClick={this.handleClearButtonClick} />,
        {
          className: `${prefixCls}-clear-button`,
        },
      );
    }
    return null;
  }

  renderMultipleHolder() {
    const { name, multiple } = this;
    const hasValue = this.getValue() !== undefined && this.getValue() !== null;
    const placeholder = this.hasFloatLabel ? undefined : this.getPlaceholders()[0];
    const width = (hasValue ? 0 : measureTextWidth(placeholder || '') + 32);
    if (multiple) {
      return (
        <input
          key="value"
          className={`${this.prefixCls}-multiple-value`}
          value={this.toValueString(this.getValue()) || ''}
          name={name}
          onChange={noop}
          style={{ width }}
        />
      );
    }
    return undefined;
  }

  getEditor(): ReactNode {
    const {
      prefixCls,
      multiple,
      props: { style },
    } = this;
    const otherProps = this.getOtherProps();
    const { height } = (style || {}) as CSSProperties;
    if (multiple) {
      return (
        <div key="text" className={otherProps.className}>
          <Animate
            component="ul"
            componentProps={{
              ref: this.saveTagContainer,
              onScroll: stopPropagation,
              style:
                height && height !== 'auto' ? { height: pxToRem(toPx(height)! - 2) } : undefined,
            }}
            transitionName="zoom"
            exclusive
            onEnd={this.handleTagAnimateEnd}
            onEnter={this.handleTagAnimateEnter}
          >
            {this.renderMultipleValues()}
            {this.renderMultipleEditor({
              ...otherProps,
              className: `${prefixCls}-multiple-input`,
            } as T)}
          </Animate>
        </div>
      );
    }
    const text = this.getTextNode();
    const finalText = isString(text) ? text : this.getText(this.getValue());
    const hasValue = this.getValue() !== undefined && this.getValue() !== null;
    const placeholder = this.hasFloatLabel ? undefined : this.getPlaceholders()[0];
    const width = (hasValue ? measureTextWidth(finalText) + 52 : measureTextWidth(placeholder || '') + 32);
    if (isValidElement(text)) {
      otherProps.style = { ...otherProps.style, width, textIndent: -1000 };
    } else {
      otherProps.style = { width, ...otherProps.style };
    }
    return (
      <input
        key="text"
        {...otherProps}
        placeholder={placeholder}
        value={finalText}
        readOnly={!this.editable}
      />
    );
  }
}

@observer
export default class ObserverFlatSelect extends FlatSelect<SelectProps> {
  static defaultProps = FlatSelect.defaultProps;

  static Option = Option;

  static OptGroup = OptGroup;
}
