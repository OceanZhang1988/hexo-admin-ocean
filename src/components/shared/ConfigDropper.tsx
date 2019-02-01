
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import cx from 'classnames';
import { AutoList } from './AutoList';
import ReactDOM from 'react-dom';

const dateFormat = 'MMM D YYYY HH:mm';

function toText(lst, map) {
  return lst.map((name) => map[name] || name);
}

function addMetadata(state, metadata, post) {
  for (const meta of metadata) {
    state[meta] = post[meta];
  }
}

function isMetadataEqual(state, metadata, post) {
  let isEqual = true;
  for (let i = 0; i < metadata.length && isEqual; i++) {
    isEqual = isEqual && state[metadata[i]] === post[metadata[i]];
  }
  return isEqual;
}

export class ConfigDropper extends React.Component<any, any> {
  constructor(props) {
    super(props);
    const tagCatMeta = this.props.tagsCategoriesAndMetadata;
    this.state = {
      open: false,
      date: moment(this.props.post.date).format(dateFormat),
      tags: toText(this.props.post.tags, tagCatMeta.tags),
      categories: toText(this.props.post.categories, tagCatMeta.categories),
      author: this.props.post.author,
    };
    addMetadata(this.state, tagCatMeta.metadata, this.props.post);
  }
  public componentWillReceiveProps(nextProps) {
    if (nextProps.post === this.props.post) {
      return;
    }
    const tagCatMeta = nextProps.tagsCategoriesAndMetadata;
    const state = {
      date: moment(nextProps.post.date).format(dateFormat),
      tags: toText(nextProps.post.tags, tagCatMeta.tags),
      categories: toText(nextProps.post.categories, tagCatMeta.categories),
      author: nextProps.post.author,
    };
    addMetadata(state, tagCatMeta.metadata, nextProps.post);
    this.setState(state);
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.open && !prevState.open) {
      document.addEventListener('mousedown', this.globalMouseDown);
    }
    if (!this.state.open && prevState.open) {
      document.removeEventListener('mousedown', this.globalMouseDown);
    }
  }

  private getDOMNode = () => {
    return ReactDOM.findDOMNode(this);
  }

  private globalMouseDown = (e: any) => {
    const mine = this.getDOMNode();
    let node = e.target;
    while (node) {
      if (!node.parentNode) return;
      node = node.parentNode;
      if (node === document.body) break;
      if (node === mine) return;
    }
    this.onClose();
  }

  private toggleShow = () => {
    if (this.state.open) {
      this.save();
    }
    this.setState({
      open: !this.state.open,
    });
  }

  private onClose = () => {
    this.save();
    this.setState({ open: false });
  }
  private onChangeDate = (e) => {
    this.setState({
      date: e.target.value,
    });
  }

  private onChangeAuthor = (e) => {
    this.setState({
      author: e.target.value,
    });
  }

  private onChangeMetadata = (e) => {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  private onChange = (attr, value) => {
    const update = {};
    update[attr] = value;
    this.setState(update);
  }

  private save() {
    let date = moment(this.state.date);
    if (!date.isValid()) {
      date = moment(this.props.post.date);
    }
    const tagCatMeta = this.props.tagsCategoriesAndMetadata;
    const tags = toText(this.props.post.tags, tagCatMeta.tags);
    const categories = toText(this.props.post.categories, tagCatMeta.categories);
    const author = this.props.post.author;
    const textDate = date.toISOString();
    const isSameMetadata = isMetadataEqual(this.state, tagCatMeta.metadata, this.props.post);
    if (textDate === this.props.post.date &&
      _.isEqual(this.state.categories, categories) &&
      _.isEqual(this.state.tags, tags) && author === this.state.author &&
      isSameMetadata) {
      return;
    }
    const state = {
      date: date.toISOString(),
      categories: this.state.categories,
      tags: this.state.tags,
      author: this.state.author,
    };
    addMetadata(state, tagCatMeta.metadata, this.state);
    this.props.onChange(state);
  }

  private config() {
    return (
      <div className="config">
        <div className="config_section">
          <div className="config_section-title">Date</div>
          <input
            className="config_date"
            value={this.state.date}
            onChange={this.onChangeDate} />
        </div>
        <div className="config_section">
          <div className="config_section-title">Author</div>
          <input
            className="config_author"
            value={this.state.author}
            onChange={this.onChangeAuthor} />
        </div>
        <div className="config_section">
          <div className="config_section-title">Tags</div>
          <AutoList
            options={this.props.tagsCategoriesAndMetadata.tags}
            values={this.state.tags}
            onChange={this.onChange.bind(null, 'tags')} />
        </div>
        <div className="config_section">
          <div className="config_section-title">Categories</div>
          <AutoList
            options={this.props.tagsCategoriesAndMetadata.categories}
            values={this.state.categories}
            onChange={this.onChange.bind(null, 'categories')} />
        </div>
        {this.configMetadata()}
      </div>
    );
  }

  private configMetadata() {
    const metadata = this.props.tagsCategoriesAndMetadata.metadata;
    return metadata.map((name, index) => {
      const component = (_.isArray(this.state[name]))
        ? <AutoList
          options={[]}
          values={this.state[name]}
          onChange={this.onChange.bind(null, name)} />
        : <input
          className="config_metadata"
          value={this.state[name]}
          name={name}
          onChange={this.onChangeMetadata} />;

      return (
        <div key={index} className="config_section">
          <div className="config_section-title">{name}</div>
          {component}
        </div>
      );
    });
  }

  public render() {
    return (
      <div className={cx({
        'config-dropper': true,
        'config-dropper--open': this.state.open,
      })}
        title="Settings">
        <div className="config-dropper_handle"
          onClick={this.toggleShow}>
          <i className="fa fa-gear" />
        </div>
        {this.state.open && this.config()}
      </div>
    );
  }
}
