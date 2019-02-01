
import React from 'react';
import ReactDOM from 'react-dom';
import CM from 'codemirror/lib/codemirror';
import 'codemirror/mode/markdown/markdown';
import { imageService } from '../../services/ImageService';

interface ICodeMirrorProps {
  initialValue: string;
  onScroll: (value) => void;
  forceLineNumbers: boolean;
  adminSettings: any;
  onChange: (value) => void;
}

export class CodeMirror extends React.Component<ICodeMirrorProps, any> {
  private cm;
  public componentDidUpdate(prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.cm.setValue(this.props.initialValue);
    }
    // on forcing line numbers, set or unset linenumbers if not set in adminSettings
    if (prevProps.forceLineNumbers !== this.props.forceLineNumbers) {
      if (!(this.props.adminSettings.editor || {}).lineNumbers) {
        this.cm.setOption('lineNumbers', this.props.forceLineNumbers);
      }
    }
  }
  private getDOMNode() {
    return ReactDOM.findDOMNode(this) as any;
  }
  public componentDidMount() {
    const editorSettings = {
      value: this.props.initialValue || '',
      theme: 'default',
      mode: 'markdown',
      lineWrapping: true,
    };
    for (const key in this.props.adminSettings.editor) {
      if (this.props.adminSettings.editor.hasOwnProperty(key)) {
        editorSettings[key] = this.props.adminSettings.editor[key];
      }
    }

    this.cm = CM(this.getDOMNode(), editorSettings);
    this.cm.on('change', (cm) => {
      this.props.onChange(cm.getValue());
    });
    this.cm.on('scroll', (cm) => {
      const node = cm.getScrollerElement();
      const max = node.scrollHeight - node.getBoundingClientRect().height;
      this.props.onScroll(node.scrollTop / max);
    });
    const box = this.getDOMNode().parentNode.getBoundingClientRect();
    this.cm.setSize(box.width, box.height - 32);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('paste', this.onPaste);
  }

  private onResize = () => {
    const box = this.getDOMNode().parentNode.getBoundingClientRect();
    // need to subtract header to get proper height without flexbox (see #124)
    this.cm.setSize(box.width, box.height - 32);
  }

  public componentWillUnmount() {
    document.removeEventListener('paste', this.onPaste);
    document.removeEventListener('resize', this.onResize);
  }

  private onPaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    if (!items.length) return;
    let blob;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].kind === 'file') {
        blob = items[i].getAsFile();
        break;
      }
    }
    if (!blob) return;

    const settings = this.props.adminSettings;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let filename;
      if (settings.options) {
        if (!!settings.options.askImageFilename) {
          const filePath = !!settings.options.imageRootPath ? settings.options.imageRootPath : '/uploads';
          filename = prompt(`What would you like to name the photo? All files saved as pngs. Name will be relative to ${filePath}.`, 'image.png');
        }
      }
      console.log(filename);
      imageService.uploadImage(e.target.result, filename).then((res) => {
        this.cm.replaceSelection(`\n![${res.msg}](${res.src})`);
      });
    };
    reader.readAsDataURL(blob);
  }

  public render() {
    return <div />;
  }
}
