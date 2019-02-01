export interface ITags {
  [index: string]: string;
}

export interface ICategories {
  [index: string]: string;
}

export interface ITagCategoriesMetadata {
  categories: ICategories;
  tags: ITags;
  metadata: any[];
}
