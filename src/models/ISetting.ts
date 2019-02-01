export interface ISetting {
  options: {
    lineNumbers: boolean;
    spellcheck: boolean;
    askImageFilename: boolean;
    imageRootPath: string;
    imagePathFolderFormat: string;
    imagePrefix: string;
  };
  editor: {
    lineNumbers: boolean;
    inputStyle: string;
    spellcheck: boolean;
  };
}
