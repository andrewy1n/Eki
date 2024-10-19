// context/PagesContext.tsx

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Page, Stamp } from '../models/Page';
import { Stampbook } from '../models/Stampbook';
import { testStampbooks } from '../data/testData';
import { savePagesToStorage, getPagesFromStorage } from '../utils/storage';

interface PagesContextProps {
  stampbooks: Stampbook[];
  addStampbook: (stampbook: Stampbook) => void;
  addPage: (stampbookId: string, page: Page) => void;
  updatePage: (stampbookId: string, updatedPage: Page) => void;
  addStamp: (stampbookId: string, pageId: string, stamp: Stamp) => void;
  addNote: (stampbookId: string, pageId: string, note: string) => void;
  addLocation: (stampbookId: string, pageId: string, location: Page['location']) => void;
}

export const PagesContext = createContext<PagesContextProps>({
  stampbooks: [],
  addStampbook: () => {},
  addPage: () => {},
  updatePage: () => {},
  addStamp: () => {},
  addNote: () => {},
  addLocation: () => {},
});

interface PagesProviderProps {
  children: ReactNode;
}

export const PagesProvider: React.FC<PagesProviderProps> = ({ children }) => {
  const [stampbooks, setStampbooks] = useState<Stampbook[]>((testStampbooks));

  // Initialize with test data on first load
  useEffect(() => {
    // const initializeStampbooks = async () => {
    //   const storedStampbooks = await getPagesFromStorage();
    //   if (!storedStampbooks || storedStampbooks.length === 0) {
    //     // Initialize with testStampbooks
    //     setStampbooks(testStampbooks);
    //     await savePagesToStorage(testStampbooks);
    //   } else {
    //     setStampbooks(storedStampbooks);
    //   }
    // };

    // initializeStampbooks();
    setStampbooks(testStampbooks)
  }, []);

  const addStampbook = (stampbook: Stampbook) => {
    const updatedStampbooks = [...stampbooks, stampbook];
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  const addPage = (stampbookId: string, page: Page) => {
    const updatedStampbooks = stampbooks.map(sb => {
      if (sb.id === stampbookId) {
        return { ...sb, pages: [...sb.pages, page] };
      }
      return sb;
    });
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  const updatePage = (stampbookId: string, updatedPage: Page) => {
    const updatedStampbooks = stampbooks.map(sb => {
      if (sb.id === stampbookId) {
        const updatedPages = sb.pages.map(page =>
          page.id === updatedPage.id ? updatedPage : page
        );
        return { ...sb, pages: updatedPages };
      }
      return sb;
    });
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  const addStamp = (stampbookId: string, pageId: string, stamp: Stamp) => {
    const updatedStampbooks = stampbooks.map(sb => {
      if (sb.id === stampbookId) {
        const updatedPages = sb.pages.map(page => {
          if (page.id === pageId) {
            return { ...page, stamps: [...page.stamps, stamp] };
          }
          return page;
        });
        return { ...sb, pages: updatedPages };
      }
      return sb;
    });
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  const addNote = (stampbookId: string, pageId: string, note: string) => {
    const updatedStampbooks = stampbooks.map(sb => {
      if (sb.id === stampbookId) {
        const updatedPages = sb.pages.map(page =>
          page.id === pageId ? { ...page, notes: note } : page
        );
        return { ...sb, pages: updatedPages };
      }
      return sb;
    });
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  const addLocation = (stampbookId: string, pageId: string, location: Page['location']) => {
    const updatedStampbooks = stampbooks.map(sb => {
      if (sb.id === stampbookId) {
        const updatedPages = sb.pages.map(page =>
          page.id === pageId ? { ...page, location } : page
        );
        return { ...sb, pages: updatedPages };
      }
      return sb;
    });
    setStampbooks(updatedStampbooks);
    savePagesToStorage(updatedStampbooks);
  };

  return (
    <PagesContext.Provider
      value={{
        stampbooks,
        addStampbook,
        addPage,
        updatePage,
        addStamp,
        addNote,
        addLocation,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};
