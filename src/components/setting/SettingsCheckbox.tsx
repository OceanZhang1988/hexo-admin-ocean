import { Component } from 'react';
import { settingService } from '../../services/SettingService';

interface ISettingCheckboxProps {
  name: string;
  label: string;
  style?: object;
  defaultValue?: string;
  enableOptions?: object;
  disableOptions?: object;
  onClick?: (e) => void;
}
export class SettingsCheckbox extends Component<ISettingCheckboxProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }
  public componentDidMount() {
    const name = this.props.name;
    settingService.settings().then((settings) => {
      let checked;
      if (!settings.options) {
        checked = false;
      } else {
        checked = !!settings.options[name];
      }
      this.setState({ checked });
    });
  }

  public handleChange = (e) => {
    const name = this.props.name;
    const value = e.target.checked;
    const addedOptions = e.target.checked ? this.props.enableOptions : this.props.disableOptions;
    settingService.setSetting(name, value, addedOptions).then((result) => {
      const { updated, settings } = result;
      this.setState({
        checked: settings.options[name],
      });
    });
  }

  public render() {
    return (
      <p style={this.props.style}>
        <label>
          <input
            checked={this.state.checked}
            type="checkbox"
            onChange={this.handleChange}
            onClick={this.props.onClick}
          />
          &nbsp; {this.props.label}
        </label>
      </p>
    );
  }
}
