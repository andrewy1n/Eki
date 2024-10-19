// data/testData.tsx

import { Page } from '../models/Page';
import { Stampbook } from '../models/Stampbook';
import uuid from 'react-native-uuid';

export const testPages: Page[] = [
  // Stampbook 1
  {
    id: uuid.v4().toString(),
    stampbookId: 'stampbook-1',
    imageUri: 'https://placekitten.com/800/600',
    stamps: [
      {
        id: uuid.v4().toString(),
        imageUri: 'https://placekitten.com/100/100',
        borderRadius: 15,
        transformations: {
          position: { x: 50, y: 100 },
          scale: 1.0,
          rotation: 0,
        },
      },
      // Additional stamps...
    ],
    notes: 'Sample note for the first page in Stampbook 1.',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    stamped: true,
  },
  ...createEmptyPages('stampbook-1', 5),
  // Additional pages...
];

function createEmptyPages(stampbookId: string, count: number): Page[] {
    const pages: Page[] = [];
    for (let i = 0; i < count; i++) {
      pages.push({
        id: uuid.v4().toString(),
        stampbookId: stampbookId,
        imageUri: null,
        stamps: [],
        notes: '',
        location: null,
        stamped: false,
      });
    }
    return pages;
  }

export const testStampbooks: Stampbook[] = [
  {
    id: 'stampbook-1',
    city: 'Seattle',
    state: 'Washington',
    pages: testPages.filter(page => page.stampbookId === 'stampbook-1'),
  },
  {
    id: 'stampbook-2',
    city: 'Los Angeles',
    state: 'California',
    pages: testPages.filter(page => page.stampbookId === 'stampbook-2'),
  },
  // Additional stampbooks...
];
