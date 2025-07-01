import fs from 'fs'
import path from 'path'
import Fuse from 'fuse.js'
import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/async_handler'
import { searchCollection, searchProtocol } from '../utils/firebase'
import { privateEncrypt } from 'crypto'

interface PageEntry {
  book: string
  page: string
  content: string
}
interface PageEntry {
  book: string;
  page: string;
  content: string;
}

export const searchString = asyncHandler(async (req: Request, res: Response) => {
  const { searchString, books: selectedBooks } = req.body as {
    searchString: string;
    books: string[];
  };

  if (!searchString || !selectedBooks?.length) {
    return res.status(400).json({ error: 'searchString and books are required' });
  }

  const jsonPath = path.join(process.cwd(), 'assets', 'books.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const books: Record<string, Record<string, string>> = JSON.parse(rawData);

  const pages: PageEntry[] = [];

  for (const bookTitle of selectedBooks) {
    const bookPages = books[bookTitle];
    if (!bookPages) continue;

    for (const [pageNumber, content] of Object.entries(bookPages)) {
      pages.push({
        book: bookTitle,
        page: pageNumber,
        content
      });
    }
  }

  const fuse = new Fuse(pages, {
    keys: ['content'],
    threshold: 0.3
  });

  const results = fuse.search(searchString);

  res.json(results.map(r => ({
    book: r.item.book,
    page: r.item.page,
    content: r.item.content
  })));
});


export const getProtocolImage = asyncHandler(async (req: Request, res: Response) => {
  const { book, page } = req.body as { book: string, page: number }
  try{

    const image_path=`https://firebasestorage.googleapis.com/v0/b/accupressure-d2905.firebasestorage.app/o/Pages%2F${book}%2F${page}.jpg?alt=media&token=1c5e8264-e9fd-4fd6-94e9-dd3b008a2996`


    return res.status(200).json({ image_path })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})


export const getProtocol = asyncHandler(async (req: Request, res: Response) => {
  const {searchText} = req.body as {searchText: string}
  if (!searchText) {
    return res.status(400).json({ message: 'Search text is required' })
  }
  try{
    const protocols= await searchProtocol(searchText.toLowerCase())
    if (protocols.length === 0) {
      return res.status(404).json({ message: 'No protocols found' })
    }
    const formattedProtocols = protocols.map((protocol) => {
      return {
        "ListId": protocol.ListId || 0,
        "ListText": protocol.ListText || '',
        "IndexText": protocol.IndexText || '',
        "Book": protocol.Book || '',
        "Page": protocol.Page || '',
      }})
    return res.status(200).json(formattedProtocols)
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
  });