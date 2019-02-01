
import React from 'react';
import cx from 'classnames';

export class AutoList extends React.Component<any, any> {
  private input;
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      text: '',
    };
    this.input = React.createRef();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (prevState.selected === null &&
      this.state.selected !== null) {
      setTimeout(() => this.input.current.focus(), 100);
    }
  }

  public onChange = (e) => {
    this.setState({ text: e.target.value });
  }

  public onEdit = (i, e) => {
    if (e.button !== 0) { return; }
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      selected: i,
      text: this.props.values[i] || '',
    });
  }

  public onBlur = () => {
    const values = this.props.values.slice();
    if (this.props.values.indexOf(this.state.text) === -1) {
      if (this.state.selected >= values.length) {
        if (this.state.text) {
          values.push(this.state.text);
        }
      } else {
        values[this.state.selected] = this.state.text;
      }
    }
    this.setState({
      selected: null,
      text: '',
    });
    this.props.onChange(values);
  }

  private onRemove = (i) => {
    const values = this.props.values.slice();
    if (i >= values.length) return;
    values.splice(i, 1);
    if (this.state.selected !== null &&
      i < this.state.selected) {
      this.setState({ selected: i - 1 });
    }
    this.props.onChange(values);
  }

  private onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!this.state.text) return;
      this.addAfter();
    }
  }

  private addAfter() {
    if (this.props.values.indexOf(this.state.text) !== -1) {
      return;
    }
    const values = this.props.values.slice();
    if (this.state.selected === values.length) {
      values.push(this.state.text);
      this.props.onChange(values);
      return this.setState({
        text: '',
        selected: values.length,
      });
    }
    values[this.state.selected] = this.state.text;
    values.splice(this.state.selected + 1, 0, '');
    this.props.onChange(values);
    this.setState({
      selected: this.state.selected + 1,
      text: '',
    });
  }

  public render() {
    const values = this.props.values.concat(['Add new']);
    return (
      <div className="autolist">
        {values.map((item, i) =>
          <div key={item} className="autolist_item">
            {i === this.state.selected ?
              <input
                ref={this.input}
                className="autolist_input"
                value={this.state.text}
                onBlur={this.onBlur}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown} /> :
              <div className={cx({
                'autolist_show': true,
                'autolist_show--new': i === values.length - 1,
              })}
                onMouseDown={this.onEdit.bind(null, i)}>
                {item}
              </div>
            }
            {
              i < values.length - 1 &&
              <i className="autolist_del fa fa-times"
                onClick={this.onRemove.bind(null, i)} />
            }
          </div>,
        )}
      </div>
    );
  }
}
