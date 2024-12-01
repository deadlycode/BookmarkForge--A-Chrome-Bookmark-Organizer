import { useState } from 'react';
import { Header } from './components/Header';
import { BookmarkList } from './components/BookmarkList';
import { FileUploadModal } from './components/FileUploadModal';
import { GeminiSetup } from './components/GeminiSetup';
import { BookmarkActions } from './components/BookmarkActions';
import { useBookmarkStore } from './store/bookmarkStore';

function App() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGeminiSetup, setShowGeminiSetup] = useState(false);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onUploadClick={() => setShowUploadModal(true)}
        onGeminiClick={() => setShowGeminiSetup(true)}
        hasBookmarks={bookmarks.length > 0}
      />
      
      <main className="container mx-auto px-4 py-8">
        {bookmarks.length > 0 && <BookmarkActions />}
        <BookmarkList />
      </main>

      {showUploadModal && (
        <FileUploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {showGeminiSetup && (
        <GeminiSetup onClose={() => setShowGeminiSetup(false)} />
      )}
    </div>
  );
}

export default App;