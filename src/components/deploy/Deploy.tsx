import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';
import { deployService } from '../../services/DeployService';

export class Deploy extends Component<IRouteProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      stdout: '',
      stderr: '',
      error: null,
      message: '',
      status: 'initial',
    };
  }
  private handleSubmit = (e) => {
    e.preventDefault();
    const message = this.state.message;
    this.setState({
      message: '',
      error: null,
      stdout: '',
      stderr: '',
      status: 'loading',
    });
    deployService.deploy(message).then(result => {
      this.setState({
        status: result.error ? 'error' : 'success',
        error: result.error,
        stdout: result.stdout && result.stdout.trim(),
        stderr: result.stderr && result.stderr.trim(),
      });
    });
  }

  public render() {
    let body;
    if (this.state.error) {
      body = <h4>Error: {this.state.error}</h4>;
    } else if (this.state.status === 'loading') {
      body = <h4>Loading...</h4>;
    } else if (this.state.status === 'success') {
      body = (
        <div>
          <h4>Std Output</h4>
          <pre>
            {this.state.stdout}
          </pre>
          <h4>Std Error</h4>
          <pre>
            {this.state.stderr}
          </pre>
        </div>
      );
    }
    return (
      <div className="deploy" style={{ whiteSpace: 'nowrap' }}>
        <p>
          Type a message here and hit `deploy` to run your deploy script.
        </p>
        <form className="deploy_form" onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="deploy_message"
            value={this.state.message}
            placeholder="Deploy/commit message"
            onChange={e => this.setState({ message: e.target.value })}
          />
          <input type="submit" value="Deploy" />
        </form>
        {body}
      </div>
    );
  }
}
