import React from 'react';
import { Modal } from './Modal';

interface IConfirmProps {
  confirmLabel: 'OK';
  abortLabel: 'Cancel';
  description: string;
  message: string;
}

export class Confirm extends React.Component<IConfirmProps, any> {
  private confirm;
  private promise;
  constructor(props) {
    super(props);
    this.confirm = React.createRef();
  }

  public static defaultProps = {
    confirmLabel: 'OK',
    abortLabel: 'Cancel',
  };

  public abort = () => {
    return this.promise.reject();
  }

  public confirmHandle = () => {
    return this.promise.resolve();
  }

  public componentDidMount() {
    this.promise = $.Deferred();
    return this.confirm.current.focus();
  }

  public render() {
    let modalBody;
    if (this.props.description) {
      modalBody = (
        <div className="modal-body">
          {this.props.description}
        </div>
      );
    }
    return (
      <Modal>
        <div className="modal-header">
          <h4 className="modal-title">
            {this.props.message}
          </h4>
        </div>
        {modalBody}
        <div className="modal-footer">
          <div className="text-right">
            <button
              role="abort"
              type="button"
              className="btn btn-default"
              onClick={this.abort}
            >
              {this.props.abortLabel}
            </button>
            {' '}
            <button
              role="confirm"
              type="button"
              className="btn btn-primary"
              ref={this.confirm}
              onClick={this.confirmHandle}
            >
              {this.props.confirmLabel}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
