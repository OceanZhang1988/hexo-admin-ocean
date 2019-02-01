import React from 'react';
import _ from 'lodash';
import marked from 'marked';
import moment from 'moment';
import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';
import { pageService } from '../../services/PageService';
import { settingService } from '../../services/SettingService';
import { Editor } from '../shared/Editor';

export class Page extends Component<IRouteProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      updated: moment(),
    };
  }
  private page;
  private getPageId() {
    const params = this.props.match.params as any;
    return params.pageId;
  }

  private async loadData() {
    const page = await pageService.pageGet(this.getPageId());
    const settings = await settingService.settings();
    this.handleData({
      page,
      settings,
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
    this.page = _.debounce((update) => {
      const now = moment();
      pageService.pageSave(this.getPageId(), update).then(() => {
        this.setState({
          updated: now,
        });
      });
    }, 1000, { trailing: true, loading: true });
    this.loadData();
  }

  private handleChange = (update) => {
    const now = moment();
    pageService.pageSave(this.getPageId(), update).then((result) => {
      const { page } = result;
      this.setState({
        page,
        updated: now,
      });
    });
  }

  private handleChangeContent = (text) => {
    if (text === this.state.raw) { return; }
    this.setState({
      raw: text,
      updated: null,
      rendered: marked(text),
    });
    this.page({ _content: text });
  }

  private handleChangeTitle = (title) => {
    if (title === this.state.title) {
      return;
    }
    this.setState({ title });
    this.page({ title });
  }

  private handlePublish = () => {
    if (!this.state.page.isDraft) return;
    pageService.publish(this.state.page._id).then((page) => {
      this.setState({ page });
    });
  }

  private handleUnpublish = () => {
    if (this.state.page.isDraft) return;
    pageService.unpublish(this.state.page._id).then((page) => {
      this.setState({ page });
    });
  }

  private dataDidLoad(name, data) {
    if (name !== 'page') return;
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
    const { page, settings } = this.state;

    if (!page || !settings) {
      return <span>Loading...</span>;
    }
    return <Editor
      isPage={true}
      post={page}
      raw={this.state.initialRaw}
      wordCount={this.state.raw ? this.state.raw.split(' ').length : 0}
      isDraft={page.isDraft}
      updated={this.state.updated}
      title={this.state.title}
      rendered={this.state.rendered}
      onChange={this.handleChange}
      onChangeContent={this.handleChangeContent}
      onChangeTitle={this.handleChangeTitle}
      onPublish={this.handlePublish}
      onUnpublish={this.handleUnpublish}
      adminSettings={settings}
    />;
  }
}
