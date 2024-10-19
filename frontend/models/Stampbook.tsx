// models/Stampbook.ts

import { Page } from './Page';

export interface Stampbook {
  id: string;
  city: string;
  state: string;
  pages: Page[];
}
