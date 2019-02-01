import React from 'react';
import { settingService } from '../../services/SettingService';

interface ISettingsTextboxProps {
  name: string;
  defaultValue: string;
  label: string;
}
export class SettingsTextbox extends React.Component<ISettingsTextboxProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue,
    };
  }

  public componentDidMount() {
    const name = this.props.name;
    const defaultValue = this.props.defaultValue;
    settingService.settings().then((settings) => {
      let value;
      if (!settings.options) {
        value = defaultValue;
      } else {
        if (!settings.options[name]) {
          value = defaultValue;
        } else {
          value = settings.options[name];
        }
      }
      this.setState({ value });
    });
  }

  private handleChange = (e) => {
    const name = this.props.name;
    const value = e.target.value;
    settingService.setSetting(name, value).then((result) => {
      const { updated, settings } = result;
      console.log(updated);
      this.setState({
        value: settings.options[name],
      });
    });
  }

  public render() {
    return (
      <p>
        <b>{this.props.label}:  </b>
        <input
          type="text"
          onChange={this.handleChange}
          value={this.state.value}
        />
      </p>
    );
  }
}
