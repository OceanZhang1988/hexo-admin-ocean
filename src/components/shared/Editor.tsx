import path from 'path';
import React from 'react';
import cx from 'classnames';
import { CodeMirror } from './CodeMirror';
import { SinceWhen } from './SinceWhen';
import { CheckGrammar } from './CheckGrammar';
import { ConfigDropper } from './ConfigDropper';
import { RenameFile } from './RenameFile';
import { Rendered } from './Rendered';

interface IEditorProps {
  post: any;
  raw: string;
  isPage?: boolean;
  updatedRaw?: string;
  onChange?: (value) => void;
  onChangeTitle: (value) => void;
  title: string;
  updated: object;
  isDraft: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onRemove?: () => void;
  onChangeContent: (value) => void;
  wordCount?: number;
  rendered: string;
  tagsCategoriesAndMetadata?: object;
  adminSettings: object;
}

export class Editor extends React.Component<IEditorProps, any> {
  private rendered;
  constructor(props) {
    super(props);
    const url = window.location.pathname.split('/');
    const rootPath = url.slice(0, url.indexOf('admin')).join('/');
    this.state = {
      previewLink: path.join(rootPath, this.props.post.path),
      checkingGrammar: false,
    };
    this.rendered = React.createRef();
  }

  private handlePreviewLink = (previewLink) => {
    console.log('updating preview link');
    this.setState({
      previewLink: path.join(previewLink),
    });
  }

  private handleChangeTitle = (e) => {
    return this.props.onChangeTitle(e.target.value);
  }

  private handleScroll = (percent) => {
    if (!this.state.checkingGrammar) {
      const node = this.rendered.current.getDOMNode();
      const height = node.getBoundingClientRect().height;
      node.scrollTop = (node.scrollHeight - height) * percent;
    }
  }

  private onCheckGrammar = () => {
    this.setState({
      checkingGrammar: !this.state.checkingGrammar,
    });
  }

  public render() {
    return <div className={cx({
      'editor': true,
      'editor--draft': this.props.isDraft,
    })}>
      <div className="editor_top">
        <input
          className="editor_title"
          value={this.props.title}
          onChange={this.handleChangeTitle} />
        {!this.props.isPage && <ConfigDropper
          post={this.props.post}
          tagsCategoriesAndMetadata={this.props.tagsCategoriesAndMetadata}
          onChange={this.props.onChange} />}
        {!this.props.isPage && (this.props.isDraft ?
          <button className="editor_publish" onClick={this.props.onPublish}>
            Publish
          </button> :
          <button className="editor_unpublish" onClick={this.props.onUnpublish}>
            Unpublish
          </button>)}
        {!this.props.isPage && (this.props.isDraft ?
          <button className="editor_remove" title="Remove"
            onClick={this.props.onRemove}>
            <i className="fa fa-trash-o" aria-hidden="true" />
          </button> :
          <button className="editor_remove" title="Can't Remove Published Post"
            onClick={this.props.onRemove} disabled>
            <i className="fa fa-trash-o" aria-hidden="true" />
          </button>)}
        {!this.props.isPage &&
          <button className="editor_checkGrammar" title="Check for Writing Improvements"
            onClick={this.onCheckGrammar}>
            <i className="fa fa-check-circle-o" />
          </button>}
      </div>
      <div className="editor_main">
        <div className="editor_edit">
          <div className="editor_md-header">
            {this.props.updated &&
              <SinceWhen className="editor_updated"
                prefix="saved "
                time={this.props.updated} />}
            <span>Markdown&nbsp;&nbsp;
              <RenameFile post={this.props.post}
                handlePreviewLink={this.handlePreviewLink} /></span>
          </div>
          <CodeMirror
            onScroll={this.handleScroll}
            initialValue={this.props.raw}
            onChange={this.props.onChangeContent}
            forceLineNumbers={this.state.checkingGrammar}
            adminSettings={this.props.adminSettings} />
        </div>
        <div className="editor_display">
          <div className="editor_display-header">
            <span className="editor_word-count">
              {this.props.wordCount} words
            </span>
            Preview
            {' '}<a className="editor_perma-link" href={this.state.previewLink} target="_blank">
              <i className="fa fa-link" /> {this.state.previewLink}
            </a>
          </div>
          {!this.state.checkingGrammar && <Rendered
            ref={this.rendered}
            className="editor_rendered"
            text={this.props.rendered} />}
          {this.state.checkingGrammar && <CheckGrammar
            toggleGrammar={this.onCheckGrammar}
            raw={this.props.updatedRaw} />}
        </div>
      </div>
    </div>;
  }
}
