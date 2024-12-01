import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API başarıyla başlatıldı');
  } catch (error) {
    console.error('Gemini API başlatma hatası:', error);
    throw error;
  }
};

const getGeminiModel = () => {
  try {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('Gemini API anahtarı bulunamadı. Lütfen önce API anahtarınızı ayarlayın.');
    }

    if (!genAI) {
      initializeGemini(apiKey);
    }

    return genAI!.getGenerativeModel({ model: 'gemini-pro' });
  } catch (error) {
    console.error('Gemini model alınırken hata:', error);
    throw error;
  }
};

// Yeniden deneme fonksiyonu
const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    // 503 hatası için daha uzun bekleme süresi
    const waitTime = error.message?.includes('503') ? delay * 2 : delay;
    
    console.log(`Hata oluştu, ${retries} deneme hakkı kaldı. ${waitTime}ms sonra tekrar denenecek...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return retry(fn, retries - 1, waitTime);
  }
};

// Tek bir chunk'ı analiz et
const analyzeChunk = async (chunk: any[], index: number, totalChunks: number, useSimpleCategories: boolean = false, cleanTitles: boolean = false) => {
  console.log(`Chunk ${index + 1}/${totalChunks} analiz ediliyor...`);

  const prompt = useSimpleCategories ? 
    `
    Aşağıdaki yer imlerini analiz et ve her biri için sadece en uygun ana kategori öner.
    ${cleanTitles ? 'Ayrıca başlıkları daha okunaklı ve düzenli hale getir. Gereksiz uzantıları ve tekrarları kaldır.' : ''}
    Her yer imi için JSON formatında şu bilgileri döndür:
    - title: ${cleanTitles ? 'Düzenlenmiş başlık (gereksiz uzantılar ve tekrarlar olmadan)' : 'Yer iminin başlığı'}
    - url: Yer iminin URL'i
    - category: Ana kategori (örn: "Geliştirme", "Sosyal Medya", "Alışveriş", vb.)

    Başlık düzenleme örnekleri:
    - "Fine Tuning GPT-3.5-Turbo - Comprehensive Guide with Code Walkthrough - YouTube" -> "Fine Tuning GPT-3.5-Turbo"
    - "Domates Sivilce Yapar Mı - Yumurta ve Sivilce İlişkisi - Bizde Kalmasın" -> "Domates Sivilce Yapar Mı"
    - "Forget ChatGPT, Try These 7 Free AI Tools! - YouTube" -> "7 Free AI Tools"

    Lütfen kategorileri mümkün olduğunca genel tut ve alt kategorilere ayırma.
    Örneğin, "Yapay Zeka" gibi genel bir kategori kullan, "Görüntü İşleme" veya "Doğal Dil İşleme" gibi alt kategorilere ayırmak yerine.

    Sadece JSON array formatında yanıt ver. Başka açıklama ekleme.

    Yer imleri:
    ${JSON.stringify(chunk, null, 2)}
    ` :
    `
    Aşağıdaki yer imlerini analiz et ve her biri için en uygun kategori ve alt kategori öner.
    ${cleanTitles ? 'Ayrıca başlıkları daha okunaklı ve düzenli hale getir. Gereksiz uzantıları ve tekrarları kaldır.' : ''}
    Her yer imi için JSON formatında şu bilgileri döndür:
    - title: ${cleanTitles ? 'Düzenlenmiş başlık (gereksiz uzantılar ve tekrarlar olmadan)' : 'Yer iminin başlığı'}
    - url: Yer iminin URL'i
    - category: Ana kategori (örn: "Geliştirme", "Sosyal Medya", "Alışveriş", vb.)
    - subCategory: Alt kategori (örn: "JavaScript", "Frontend", "E-ticaret", vb.)

    Başlık düzenleme örnekleri:
    - "Fine Tuning GPT-3.5-Turbo - Comprehensive Guide with Code Walkthrough - YouTube" -> "Fine Tuning GPT-3.5-Turbo"
    - "Domates Sivilce Yapar Mı - Yumurta ve Sivilce İlişkisi - Bizde Kalmasın" -> "Domates Sivilce Yapar Mı"
    - "Forget ChatGPT, Try These 7 Free AI Tools! - YouTube" -> "7 Free AI Tools"

    Sadece JSON array formatında yanıt ver. Başka açıklama ekleme.

    Yer imleri:
    ${JSON.stringify(chunk, null, 2)}
    `;

  const model = getGeminiModel();
  
  return retry(async () => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // JSON yanıtını temizle ve parse et
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const startIndex = cleanedText.indexOf('[');
      const endIndex = cleanedText.lastIndexOf(']') + 1;
      const jsonStr = cleanedText.slice(startIndex, endIndex);
      
      console.log(`Chunk ${index + 1} yanıtı başarılı`);
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(`Chunk ${index + 1} parse hatası:`, error);
      console.log('Parse edilemeyen metin:', text);
      throw new Error('Gemini yanıtı JSON formatında değil');
    }
  });
};

export const analyzeBookmarkStructure = async (bookmarks: any[], useSimpleCategories: boolean = false, cleanTitles: boolean = false) => {
  console.log('Bookmark analizi başlıyor...', bookmarks);

  try {
    // Bookmarkları düzleştir
    const flatBookmarks = bookmarks.reduce((acc: any[], bookmark: any) => {
      if (bookmark.isFolder && bookmark.children) {
        return [...acc, ...flattenBookmarks(bookmark)];
      }
      if (!bookmark.isFolder && bookmark.url) {
        return [...acc, bookmark];
      }
      return acc;
    }, []);

    console.log('Düzleştirilmiş bookmarklar:', flatBookmarks.length);

    // Sadece URL ve başlık bilgilerini al
    const bookmarkData = flatBookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url
    }));

    // Her seferinde 5 bookmark analiz et (daha küçük chunk'lar)
    const chunkSize = 5;
    const chunks = [];
    for (let i = 0; i < bookmarkData.length; i += chunkSize) {
      chunks.push(bookmarkData.slice(i, i + chunkSize));
    }

    console.log(`${chunks.length} chunk oluşturuldu`);

    // Chunk'ları sırayla işle
    const analyzedBookmarks = [];
    for (let i = 0; i < chunks.length; i++) {
      const result = await analyzeChunk(chunks[i], i, chunks.length, useSimpleCategories, cleanTitles);
      analyzedBookmarks.push(...result);
      
      // Her 3 chunk'tan sonra kısa bir bekleme
      if ((i + 1) % 3 === 0 && i < chunks.length - 1) {
        console.log('Rate limit aşımını önlemek için 2 saniye bekleniyor...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('Analiz tamamlandı:', analyzedBookmarks.length);
    return analyzedBookmarks;
  } catch (error) {
    console.error('Bookmark analizi hatası:', error);
    throw error;
  }
};

const flattenBookmarks = (bookmark: any): any[] => {
  if (!bookmark.isFolder || !bookmark.children) {
    return bookmark.url ? [bookmark] : [];
  }

  return bookmark.children.reduce((acc: any[], child: any) => {
    if (child.isFolder) {
      return [...acc, ...flattenBookmarks(child)];
    }
    return child.url ? [...acc, child] : acc;
  }, []);
};