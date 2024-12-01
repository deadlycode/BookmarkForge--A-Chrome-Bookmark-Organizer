import { create } from 'zustand';
import { parseBookmarks, generateBookmarkHtml } from '../utils/bookmarkParser';
import { analyzeBookmarkStructure } from '../utils/geminiService';

interface BookmarkState {
  bookmarks: any[];
  loading: boolean;
  error: string | null;
  useSimpleCategories: boolean;
  cleanTitles: boolean;
  categories: { id: string; name: string }[];
  addBookmark: (bookmark: any) => void;
  setCleanTitles: (value: boolean) => void;
  setUseSimpleCategories: (value: boolean) => void;
  importBookmarks: (html: string) => Promise<void>;
  exportBookmarks: () => string;
  organizeBookmarks: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  loading: false,
  error: null,
  useSimpleCategories: false,
  cleanTitles: false,
  categories: [
    { id: 'other', name: 'Diğer' },
    { id: 'work', name: 'İş' },
    { id: 'personal', name: 'Kişisel' },
    { id: 'education', name: 'Eğitim' },
    { id: 'entertainment', name: 'Eğlence' }
  ],

  addBookmark: (bookmark) => {
    set((state) => ({
      bookmarks: [...state.bookmarks, bookmark]
    }));
  },

  setCleanTitles: (value: boolean) => set({ cleanTitles: value }),
  setUseSimpleCategories: (value: boolean) => set({ useSimpleCategories: value }),

  importBookmarks: async (html: string) => {
    set({ loading: true, error: null });
    try {
      const parsedBookmarks = parseBookmarks(html);
      console.log('Parsed bookmarks:', parsedBookmarks);
      set({ bookmarks: parsedBookmarks });
    } catch (error) {
      console.error('Import error:', error);
      set({ error: 'Bookmark dosyası işlenirken hata oluştu' });
    } finally {
      set({ loading: false });
    }
  },

  exportBookmarks: () => {
    const { bookmarks } = get();
    return generateBookmarkHtml(bookmarks);
  },

  organizeBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const { bookmarks, useSimpleCategories, cleanTitles } = get();
      if (!bookmarks || bookmarks.length === 0) {
        throw new Error('Organize edilecek yer imi bulunamadı');
      }

      console.log('Organizing bookmarks...');
      const analyzedBookmarks = await analyzeBookmarkStructure(bookmarks);
      console.log('Analyzed bookmarks:', analyzedBookmarks);
      
      if (!analyzedBookmarks || analyzedBookmarks.length === 0) {
        throw new Error('Yer imleri analiz edilemedi');
      }

      // Kategorilere göre grupla
      const categorizedBookmarks = analyzedBookmarks.reduce((acc: any, bookmark: any) => {
        if (!bookmark.category) {
          console.log('Kategorisi olmayan yer imi:', bookmark);
          return acc;
        }
        
        const category = bookmark.category.trim();
        
        // Basit kategorilendirme seçeneği aktifse alt kategorileri kullanma
        if (useSimpleCategories) {
          if (!acc[category]) {
            acc[category] = {
              title: category.charAt(0).toUpperCase() + category.slice(1),
              url: '',
              isFolder: true,
              children: []
            };
          }
          
          acc[category].children.push({
            title: cleanTitles ? bookmark.title.trim() : bookmark.title,
            url: bookmark.url,
            isFolder: false
          });
        } else {
          const subCategory = (bookmark.subCategory || 'Diğer').trim();
          
          if (!acc[category]) {
            acc[category] = {
              title: category.charAt(0).toUpperCase() + category.slice(1),
              url: '',
              isFolder: true,
              children: {}
            };
          }
          
          if (!acc[category].children[subCategory]) {
            acc[category].children[subCategory] = {
              title: subCategory,
              url: '',
              isFolder: true,
              children: []
            };
          }
          
          acc[category].children[subCategory].children.push({
            title: cleanTitles ? bookmark.title.trim() : bookmark.title,
            url: bookmark.url,
            isFolder: false
          });
        }
        
        return acc;
      }, {});

      console.log('Categorized bookmarks:', categorizedBookmarks);

      // Alt kategorileri düzenle
      const organizedBookmarks = [
        {
          title: 'Organize Edilmiş Yer İmleri',
          url: '',
          isFolder: true,
          children: Object.values(categorizedBookmarks).map((category: any) => {
            if (useSimpleCategories) {
              return category;
            } else {
              return {
                ...category,
                children: Object.values(category.children)
              };
            }
          })
        }
      ];

      console.log('Final organized bookmarks:', organizedBookmarks);
      set({ bookmarks: organizedBookmarks });
    } catch (error: any) {
      console.error('Organization error:', error);
      set({ error: error.message || 'Yer imleri organize edilirken hata oluştu' });
    } finally {
      set({ loading: false });
    }
  },
}));