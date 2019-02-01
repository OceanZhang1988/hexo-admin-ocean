import React from 'react';
import { postService } from '../../services/PostService';

interface INewPostProps {
  onNew(post: object);
}

export class NewPost extends React.Component<INewPostProps, any> {
  private input;
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      loading: true,
      text: 'Untitled',
    };
    this.input = React.createRef<HTMLInputElement>();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.showing && !prevState.showing) {
      const node = this.input.current;
      if (node) {
        node.focus();
        node.selectionStart = 0;
        node.selectionEnd = node.value.length;
      }
    }
  }

  public onKeydown = (e) => {
    if (e.key === 'Enter') {
      this.onSubmit(e);
    }
  }

  public onShow = () => {
    this.setState({ showing: true });
  }

  public onBlur = () => {
    if (this.state.showing) {
      this.onCancel();
    }
  }

  public onSubmit = (e) => {
    e.preventDefault();
    this.setState({ loading: true, showing: false });
    postService.newPost(this.state.text).then((post) => {
      this.setState({ showing: false, text: 'Untitled' });
      this.props.onNew(post);
    }, (err) => {
      console.error('Failed! to make post', err);
    });
  }

  public onCancel = () => {
    this.setState({ showing: false });
  }

  public onChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  }

  public render() {
    if (!this.state.showing) {
      return (
        <div className="new-post" onClick={this.onShow}>
          <div className="new-post_button">
            <i className="fa fa-plus" />{' '}
            New Post
        </div>
        </div>
      );
    }

    return (
      <div className="new-post">
        <input className="new-post_input"
          ref={this.input}
          value={this.state.text}
          onBlur={this.onBlur}
          onKeyPress={this.onKeydown}
          onChange={this.onChange}
        />
        <i className="fa fa-check-circle new-post_ok" onMouseDown={this.onSubmit} ></i>
        <i className="fa fa-times-circle new-post_cancel" onMouseDown={this.onCancel} ></i>
      </div>
    );
  }
}
