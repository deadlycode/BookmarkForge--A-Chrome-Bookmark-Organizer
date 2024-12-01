import React from 'react';
import { Upload, Settings, Download } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

interface HeaderProps {
  onUploadClick: () => void;
  onGeminiClick: () => void;
  hasBookmarks: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onGeminiClick,
  hasBookmarks
}) => {
  const { organizeBookmarks, exportBookmarks } = useBookmarkStore();

  const handleExport = () => {
    const bookmarkHtml = exportBookmarks();
    const blob = new Blob([bookmarkHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organized_bookmarks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Yer İmi Düzenleyici
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={onUploadClick}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </button>

            {hasBookmarks && (
              <>
                <button
                  onClick={onGeminiClick}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  API Ayarla
                </button>

                <button
                  onClick={() => organizeBookmarks()}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Organize Et
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};