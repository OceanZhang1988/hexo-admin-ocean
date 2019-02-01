import React from 'react';

export class Modal extends React.Component<any, any> {
  private backdrop() {
    return <div className="modal-backdrop in" />;
  }

  private modal() {
    const style = { display: 'block' };
    return (
      <div
        className="modal in"
        role="dialog"
        aria-hidden="false"
        ref="modal"
        style={style}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
  public render() {
    return (
      <div>
        {this.backdrop()}
        {this.modal()}
      </div>
    );
  }
}
