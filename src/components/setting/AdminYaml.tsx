import React from 'react';
import bcrypt from 'bcrypt-nodejs';

export class AdminYaml extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      passwordHash: '$2a$10$L.XAIqIWgTc5S1zpvV3MEu7/rH34p4Is/nq824smv8EZ3lIPCp1su',
    };
  }

  public componentDidUpdate(prevProps) {
    if (prevProps.password !== this.props.password) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(this.props.password, salt);
      this.setState({ passwordHash: hash });
    }
  }

  public render() {
    const adminYaml = [
      '# hexo-admin authentification',
      'admin:',
      '  username: ' + this.props.username,
      '  password_hash: ' + this.state.passwordHash,
      '  secret: ' + this.props.secret,
    ].join('\n');

    return (
      <pre>
        {adminYaml}
      </pre>
    );
  }
}
