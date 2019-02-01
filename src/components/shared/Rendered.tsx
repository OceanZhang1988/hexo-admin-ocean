import React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';

interface IRenderedProps {
  text: string;
  className?: string;
}

export class Rendered extends React.Component<IRenderedProps, any> {
  public getDOMNode() {
    return ReactDOM.findDOMNode(this);
  }
  public render() {
    return (
      <div className={cx('post-content', this.props.className)}
        dangerouslySetInnerHTML={{
          __html: this.props.text || '<h1 class="editor_no-content">There doesn\'t seem to be anything here</h1>',
        }} />
    );
  }
}
