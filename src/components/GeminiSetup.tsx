import React, { useState } from 'react';
import { X } from 'lucide-react';

interface GeminiSetupProps {
  onClose: () => void;
}

export const GeminiSetup: React.FC<GeminiSetupProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API anahtarı boş olamaz');
      return;
    }
    
    localStorage.setItem('gemini_api_key', apiKey);
    onClose();
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

        <h2 className="text-xl font-semibold mb-4">Gemini API Kurulumu</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Gemini API Anahtarı
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="API anahtarınızı girin"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="text-sm text-gray-600">
            <p>API anahtarı almak için:</p>
            <ol className="list-decimal ml-4 mt-1">
              <li><a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>'ya gidin</li>
              <li>Yeni bir API anahtarı oluşturun</li>
              <li>Oluşturulan anahtarı buraya yapıştırın</li>
            </ol>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};