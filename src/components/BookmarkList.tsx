import React from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { FolderIcon, LinkIcon, Loader2 } from 'lucide-react';

interface BookmarkItemProps {
  bookmark: any;
  level?: number;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, level = 0 }) => {
  const paddingLeft = `${level * 20}px`;

  if (bookmark.isFolder) {
    return (
      <div>
        <div className="flex items-center gap-2 py-1" style={{ paddingLeft }}>
          <FolderIcon className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{bookmark.title}</span>
        </div>
        <div className="bookmark-children">
          {Array.isArray(bookmark.children) ? (
            bookmark.children.map((child: any, index: number) => (
              <BookmarkItem key={index} bookmark={child} level={level + 1} />
            ))
          ) : (
            Object.values(bookmark.children).map((child: any, index: number) => (
              <BookmarkItem key={index} bookmark={child} level={level + 1} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1" style={{ paddingLeft }}>
      <LinkIcon className="w-4 h-4 text-gray-500" />
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {bookmark.title}
      </a>
    </div>
  );
};

export const BookmarkList: React.FC = () => {
  const { bookmarks, loading, error } = useBookmarkStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Hata: {error}
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-gray-500 p-4">
        Henüz yüklenmiş yer imi bulunmuyor.
      </div>
    );
  }

  return (
    <div className="p-4">
      {bookmarks.map((bookmark: any, index: number) => (
        <BookmarkItem key={index} bookmark={bookmark} />
      ))}
    </div>
  );
};