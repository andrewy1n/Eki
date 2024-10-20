// models/Stampbook.ts

import { Page } from './Page';

export interface Stampbook {
  id: string;
  city: string;
  state: string;
  pages: PageDict;
  cover: string;
}

export interface PageDict {
  [key: string]: Page[]
}
