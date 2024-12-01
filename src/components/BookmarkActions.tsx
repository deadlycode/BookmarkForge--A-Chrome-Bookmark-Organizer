import React from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Download, FolderTree } from 'lucide-react';

export const BookmarkActions: React.FC = () => {
  const organizeBookmarks = useBookmarkStore((state) => state.organizeBookmarks);
  const exportBookmarks = useBookmarkStore((state) => state.exportBookmarks);
  const loading = useBookmarkStore((state) => state.loading);
  const useSimpleCategories = useBookmarkStore((state) => state.useSimpleCategories);
  const setUseSimpleCategories = useBookmarkStore((state) => state.setUseSimpleCategories);
  const cleanTitles = useBookmarkStore((state) => state.cleanTitles);
  const setCleanTitles = useBookmarkStore((state) => state.setCleanTitles);

  const handleExport = () => {
    const html = exportBookmarks();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-col space-y-2">
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={useSimpleCategories}
            onChange={(e) => setUseSimpleCategories(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span>Fazla Ayrıntılı Klasörlendirme Kullanma</span>
        </label>
        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={cleanTitles}
            onChange={(e) => setCleanTitles(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span>Başlıkları Düzenle ve Sadeleştir</span>
        </label>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => organizeBookmarks()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderTree className="h-5 w-5 mr-2" />
          Yer İmlerini Düzenle
        </button>
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5 mr-2" />
          HTML Olarak İndir
        </button>
      </div>
    </div>
  );
};