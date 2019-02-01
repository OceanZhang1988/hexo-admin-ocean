import './settings.less';
import { Component } from 'react';
import { IRouteProps } from '../IRouteProps';
import { SettingsCheckbox } from './SettingsCheckbox';
import { Link } from 'react-router-dom';
import { SettingsTextbox } from './SettingsTextbox';

export class Settings extends Component<IRouteProps, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  public render() {
    const LineNumbers =
      <SettingsCheckbox
        name="lineNumbers"
        enableOptions={{ editor: { lineNumbers: true } }}
        disableOptions={{ editor: { lineNumbers: false } }}
        label="Enable line numbering."
      />;

    const SpellCheck =
      <SettingsCheckbox
        name="spellcheck"
        enableOptions={{ editor: { inputStyle: 'contenteditable', spellcheck: true } }}
        disableOptions={{ editor: { inputStyle: null, spellcheck: false } }}
        label="Enable spellchecking. (buggy on older browsers)"
      />;

    const AskImageFilename =
      <SettingsCheckbox
        name="askImageFilename"
        label="Always ask for filename."
        style={{ width: '300px', display: 'inline-block' }}
      />;

    const OverwriteImages =
      <SettingsCheckbox
        name="overwriteImages"
        label="Overwrite images if file already exists."
        style={{ width: '425px', display: 'inline-block' }}
      />;

    const ImageRootPath =
      <SettingsTextbox
        name="imageRootPath"
        defaultValue="/uploads"
        label="Image Root directory"
      />;

    const ImagePrefix =
      <SettingsTextbox
        name="imagePrefix"
        defaultValue="pasted-"
        label="Image filename prefix"
      />;

    const ImagePathFolderFormat =
      <SettingsTextbox
        name="imagePathFolderFormat"
        defaultValue="YYYY/MM"
        label="Image PathFolder Format"
      />;

    return (
      <div className="settings" style={{ whiteSpace: 'nowrap' }}>
        <h1>Settings</h1>
        <p>
          Set various settings for your admin panel and editor.
        </p>
        <p>
          Hexo admin can be secured with a password.
          {' '}<Link to="/auth-setup">Setup authentification here.</Link>
        </p>
        <hr />

        <h2>Editor Settings</h2>
        {LineNumbers}
        {SpellCheck}
        <hr />

        <h2>Image Pasting Settings</h2>
        <p>
          Hexo-admin allows you to paste images you copy from the web or elsewhere directly
          into the editor. Decide how you'd like to handle the pasted images.
        </p>
        {AskImageFilename}
        {OverwriteImages}
        {ImageRootPath}
        {ImagePathFolderFormat}
        {ImagePrefix}
      </div>
    );
  }
}
