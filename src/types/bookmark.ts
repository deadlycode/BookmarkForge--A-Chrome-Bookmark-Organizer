export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  notes?: string;
  dateAdded: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}