interface Bookmark {
  title: string;
  url: string;
  children?: Bookmark[];
  isFolder?: boolean;
}

export const parseBookmarks = (html: string): Bookmark[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const parseNode = (node: Element): Bookmark | null => {
    if (node.tagName === 'A') {
      return {
        title: node.textContent?.trim() || '',
        url: node.getAttribute('href') || '',
      };
    }

    if (node.tagName === 'DL') {
      const items: Bookmark[] = [];
      const folder: Bookmark = {
        title: node.previousElementSibling?.textContent?.trim() || 'Untitled Folder',
        url: '',
        children: items,
        isFolder: true,
      };

      for (const child of Array.from(node.children)) {
        if (child.tagName === 'DT') {
          const bookmark = parseNode(child.firstElementChild as Element);
          if (bookmark) {
            items.push(bookmark);
          }
        }
      }

      return folder;
    }

    return null;
  };

  const bookmarks: Bookmark[] = [];
  const dlElements = doc.querySelectorAll('dl');
  
  for (const dl of Array.from(dlElements)) {
    const bookmark = parseNode(dl);
    if (bookmark) {
      bookmarks.push(bookmark);
    }
  }

  return bookmarks;
};

export const generateBookmarkHtml = (bookmarks: Bookmark[]): string => {
  const generateBookmarkNode = (bookmark: Bookmark, level: number = 0): string => {
    const indent = '    '.repeat(level);
    
    if (bookmark.isFolder) {
      const children = bookmark.children
        ?.map(child => generateBookmarkNode(child, level + 1))
        .join('\n') || '';
        
      return `${indent}<DT><H3>${bookmark.title}</H3>
${indent}<DL><p>
${children}
${indent}</DL><p>`;
    }
    
    return `${indent}<DT><A HREF="${bookmark.url}">${bookmark.title}</A>`;
  };

  const bookmarkNodes = bookmarks
    .map(bookmark => generateBookmarkNode(bookmark))
    .join('\n');

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${bookmarkNodes}
</DL><p>`;
};
