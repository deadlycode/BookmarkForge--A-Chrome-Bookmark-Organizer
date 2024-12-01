import React, { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

interface FileUploadModalProps {
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const importBookmarks = useBookmarkStore((state) => state.importBookmarks);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html')) {
      setError('Lütfen geçerli bir HTML dosyası seçin');
      return;
    }

    try {
      const text = await file.text();
      await importBookmarks(text);
      onClose();
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
      setError('Dosya yüklenirken bir hata oluştu');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (!file || !file.name.endsWith('.html')) {
      setError('Lütfen geçerli bir HTML dosyası seçin');
      return;
    }

    try {
      const text = await file.text();
      await importBookmarks(text);
      onClose();
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
      setError('Dosya yüklenirken bir hata oluştu');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Yer İmi Dosyası Yükle</h2>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".html"
            className="hidden"
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            HTML dosyanızı buraya sürükleyin veya
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            bilgisayarınızdan seçin
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Nasıl export alınır?</p>
          <ol className="list-decimal ml-4">
            <li>Chrome'da Yer İmleri Yöneticisi'ni açın</li>
            <li>Üç nokta menüsünden "Yer imlerini dışa aktar"ı seçin</li>
            <li>Kaydedilen HTML dosyasını buraya yükleyin</li>
          </ol>
        </div>
      </div>
    </div>
  );
};