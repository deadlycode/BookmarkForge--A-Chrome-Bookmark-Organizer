import { Bookmark } from '../types/bookmark';

export const parseHtmlBookmarks = (html: string): Bookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.getElementsByTagName('a');
  
  return Array.from(links).map((link) => ({
    id: crypto.randomUUID(),
    title: link.textContent || '',
    url: link.href,
    category: 'other',
    tags: [],
    dateAdded: new Date(),
  }));
};

export const generateBookmarkHtml = (bookmarks: Bookmark[]): string => {
  const categorizedBookmarks = bookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.category]) {
      acc[bookmark.category] = [];
    }
    acc[bookmark.category].push(bookmark);
    return acc;
  }, {} as Record<string, Bookmark[]>);

  let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
  html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
  html += '<TITLE>Bookmarks</TITLE>\n';
  html += '<H1>Bookmarks</H1>\n';
  html += '<DL><p>\n';

  Object.entries(categorizedBookmarks).forEach(([category, bookmarks]) => {
    html += `  <DT><H3>${category}</H3>\n`;
    html += '  <DL><p>\n';
    bookmarks.forEach((bookmark) => {
      html += `    <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
      if (bookmark.notes) {
        html += `    <DD>${bookmark.notes}\n`;
      }
    });
    html += '  </DL><p>\n';
  });

  html += '</DL><p>';
  return html;
};