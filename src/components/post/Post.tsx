import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import marked from 'marked';
import moment from 'moment';
import { Editor } from '../shared/Editor';
import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';
import { postService } from '../../services/PostService';
import { Confirm } from '../shared/Confirm';
import { commonService } from '../../services/CommonService';
import { settingService } from '../../services/SettingService';

const confirm = (message, options) => {
  let cleanup;
  let component;
  let props;
  let wrapper;
  if (options == null) {
    options = {};
  }
  props = $.extend({ message }, options);
  wrapper = document.body.appendChild(document.createElement('div'));
  component = ReactDOM.render(<Confirm {...props} />, wrapper);
  cleanup = () => {
    ReactDOM.unmountComponentAtNode(wrapper);
    return setTimeout(() => {
      return wrapper.remove();
    });
  };

  return component.promise.always(cleanup).promise();
};

export class Post extends Component<IRouteProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      updated: moment(),
    };
  }
  private post;
  private _isMount = false;

  private getPostId() {
    const params = this.props.match.params as any;
    return params.postId;
  }

  private async loadData() {
    const post = await postService.postGet(this.getPostId());
    const tagsCategoriesAndMetadata = await commonService.tagsCategoriesAndMetadata();
    const settings = await settingService.settings();
    this.handleData({
      post,
      settings,
      tagsCategoriesAndMetadata,
    });

  }

  private handleData(items) {
    Object.keys(items).forEach((name) => {
      Promise.resolve(items[name]).then((data) => {
        this.setState({
          [name]: data,
        });
        this.dataDidLoad(name, data);
      });
    });
  }

  public componentDidMount() {
    this._isMount = true;
    console.log('Post文章:componentDidMount');
    let ctx = this;
    this.post = _.debounce((update) => {
      const now = moment();
      postService.postSave(this.getPostId(), update).then(() => {
        if (ctx._isMount){
          ctx.setState({
            updated: now,
          });
        }
      });
    }, 1000, { trailing: true, loading: true });
    this.loadData();
  }

  public componentWillUnmount(): void {
    this._isMount = false;
    console.log('Post文章:componentWillUnmount');
  }

  private handleChange = (update) => {
    const now = moment();
    postService.postSave(this.getPostId(), update).then((result) => {
      const { tagsCategoriesAndMetadata, post } = result;
      const state: any = {
        post,
        updated: now,
        author: post.author,
        tagsCategoriesAndMetadata,
      };
      for (const name of tagsCategoriesAndMetadata.metadata) {
        state[name] = post[name];
      }
      this.setState(state);
    });
  }

  private handleChangeContent = (text) => {
    if (text === this.state.raw) {
      return;
    }
    this.setState({
      raw: text,
      updated: null,
      rendered: marked(text),
    });
    this.post({ _content: text });
  }

  private handleChangeTitle = (title) => {
    if (title === this.state.title) {
      return;
    }
    this.setState({ title });
    this.post({ title });
  }

  private handlePublish = () => {
    if (!this.state.post.isDraft) return;
    postService.publish(this.state.post._id).then((post) => {
      this.setState({ post });
    });
  }

  private handleUnpublish = () => {
    if (this.state.post.isDraft) return;
    postService.unpublish(this.state.post._id).then((post) => {
      this.setState({ post });
    });
  }

  private handleRemove = () => {
    return confirm('Delete this post?', {
      description: 'This operation will move current draft into source/_discarded folder.',
      confirmLabel: 'Yes',
      abortLabel: 'No',
    }).then(() => {
      postService.remove(this.state.post._id).then(() => {
        this.props.history.push('/posts');
      });
    });
  }

  private dataDidLoad(name, data) {
    if (name !== 'post') return;
    const parts = data.raw.split('---');
    const raw = parts.slice(parts[0] === '' ? 2 : 1).join('---').trim();
    this.setState({
      raw,
      title: data.title,
      initialRaw: raw,
      rendered: data.content,
    });
  }

  public render() {
    const { post, settings, tagsCategoriesAndMetadata } = this.state;
    if (!post || !tagsCategoriesAndMetadata || !settings) {
      return <span>Loading...</span>;
    }
    return <Editor
      post={post}
      raw={this.state.initialRaw}
      updatedRaw={this.state.raw}
      wordCount={this.state.raw ? this.state.raw.split(' ').length : 0}
      isDraft={post.isDraft}
      updated={this.state.updated}
      title={this.state.title}
      rendered={this.state.rendered}
      onChange={this.handleChange}
      onChangeContent={this.handleChangeContent}
      onChangeTitle={this.handleChangeTitle}
      onPublish={this.handlePublish}
      onUnpublish={this.handleUnpublish}
      onRemove={this.handleRemove}
      tagsCategoriesAndMetadata={tagsCategoriesAndMetadata}
      adminSettings={settings}
    />;
  }
}
