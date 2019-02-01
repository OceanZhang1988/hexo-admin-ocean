
import React from 'react';

export class SinceWhen extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.time.fromNow(),
    };
  }
  public static defaultProps = {
    prefix: '',
  };
  private iv;
  public componentDidMount() {
    this.iv = setInterval(this.tick, 5000);
  }

  public componentWillUnmount() {
    clearInterval(this.iv);
  }

  public tick = () => {
    this.setState({ time: this.props.time.fromNow() });
  }

  public render() {
    return (
      <span className={this.props.className}>{this.props.prefix + this.state.time}</span>
    );
  }
}
