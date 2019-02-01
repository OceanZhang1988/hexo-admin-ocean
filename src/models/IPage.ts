export interface IPage {
  layout: string;
  title: string;
  date: string;
  _content: string;
  source: string;
  raw: string;
  updated: string;
  path: string;
  comments: boolean;
  _id: string;
  content: string;
  site: { data: object };
  excerpt: string;
  more: string;
  permalink: string;
  full_source: string;
  isDraft: boolean;
  isDiscarded: boolean;
}
