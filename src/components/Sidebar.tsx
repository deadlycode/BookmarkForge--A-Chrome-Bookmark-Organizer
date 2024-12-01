import React from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Folder } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  const countBookmarks = (items: any[]): number => {
    return items.reduce((count, item) => {
      if (item.isFolder) {
        return count + countBookmarks(item.children || []);
      }
      return count + 1;
    }, 0);
  };

  const renderFolderStats = (items: any[]) => {
    const folders = items.filter(item => item.isFolder);
    return folders.map((folder, index) => (
      <div key={index} className="mb-2">
        <div className="flex items-center text-sm text-gray-600">
          <Folder className="h-4 w-4 mr-2" />
          <span className="truncate">{folder.title}</span>
          <span className="ml-auto text-gray-400">
            {countBookmarks(folder.children || [])}
          </span>
        </div>
        {folder.children && folder.children.some((child: any) => child.isFolder) && (
          <div className="pl-4 mt-1">
            {renderFolderStats(folder.children)}
          </div>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-16">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Yer İmi</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {countBookmarks(bookmarks)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Klasörler</h3>
            <div className="space-y-1">
              {renderFolderStats(bookmarks)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};