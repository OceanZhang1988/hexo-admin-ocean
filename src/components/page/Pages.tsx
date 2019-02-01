import _ from 'lodash';
import moment from 'moment';
import cx from 'classnames';
import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';
import { NewPage } from './NewPage';
import { Link } from 'react-router-dom';
import { Rendered } from '../shared/Rendered';
import { pageService } from '../../services/PageService';
import { IPage } from '../../models/IPage';

export class Pages extends Component<IRouteProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }

  private onNew = (page) => {
    const pages = this.state.pages.slice();
    pages.unshift(page);
    this.setState({ pages });
    this.props.history.push(`/pages/${page._id}`, {
      pageId: page._id,
    });
  }

  private goTo = (id) => (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.history.push(`/pages/${id}`, {
      pageId: id,
    });
  }

  public componentWillMount() {
    this.loadData(this.props);
  }

  public componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  public async loadData(props) {
    const pages = await pageService.pages();
    const items = _.sortBy(
      _.filter(pages, (post: IPage) => !post.isDiscarded),
      ['isDraft', 'date'],
    ).reverse();
    this.setState({
      pages: items,
    });
  }

  public render() {
    if (!this.state.pages) {
      return <div className="pages">Loading...</div>;
    }

    const current = this.state.pages[this.state.selected] || {};
    const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
    const rootPath = url.slice(0, url.indexOf('admin')).join('/');

    return (
      <div className="posts">
        <ul className="posts_list">
          <NewPage onNew={this.onNew} />
          {
            this.state.pages.map((page, i) =>
              <li key={page._id} className={cx({
                'posts_post': true,
                'posts_post--draft': page.isDraft,
                'posts_post--selected': i === this.state.selected,
              })}
                onDoubleClick={this.goTo(page._id)}
                onClick={this.setState.bind(this, { selected: i }, null)}
              >
                <span className="posts_post-title">
                  {page.title}
                </span>
                <span className="posts_post-date">
                  {moment(page.date).format('MMM Do YYYY')}
                </span>
                <a className="posts_perma-link" target="_blank" href={rootPath + '/' + page.path}>
                  <i className="fa fa-link" />
                </a>
                <Link className="posts_edit-link" to={{ pathname: `pages/${page._id}` }}>
                  <i className="fa fa-pencil" />
                </Link>
              </li>,
            )
          }
        </ul>
        <div className={cx({
          'posts_display': true,
          'posts_display--draft': current.isDraft,
        })}>
          {current.isDraft && <div className="posts_draft-message">Draft</div>}
          <Rendered
            className="posts_content"
            text={current.content} />
        </div>
      </div>
    );
  }
}
