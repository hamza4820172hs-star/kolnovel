import {db} from './database';
export type Book = {id:number;title:string;author:string|null;source_uri:string;cover_uri:string|null;added_at:number;last_opened_at:number|null;is_favorite:number};
export function listBooks():Book[] {
  return db.getAllSync<Book>('SELECT id,title,author,source_uri,cover_uri,added_at,last_opened_at,is_favorite FROM books ORDER BY added_at DESC');
}
export function addBook(title:string,author:string|null,uri:string) {
  const existing=db.getFirstSync<{id:number}>('SELECT id FROM books WHERE source_uri=?',[uri]);
  if(existing) return existing.id;
  const result=db.runSync('INSERT INTO books(title,author,source_uri,added_at) VALUES(?,?,?,?)',[title,author,uri,Date.now()]);
  return result.lastInsertRowId;
}
export function getBook(id:number) {
  return db.getFirstSync<Book>('SELECT id,title,author,source_uri,cover_uri,added_at,last_opened_at,is_favorite FROM books WHERE id=?',[id]);
}
export function toggleFavorite(id:number) {
  db.runSync('UPDATE books SET is_favorite=1-is_favorite WHERE id=?',[id]);
}
export function touchBook(id:number) {
  db.runSync('UPDATE books SET last_opened_at=? WHERE id=?',[Date.now(),id]);
}
