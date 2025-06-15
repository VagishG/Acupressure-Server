import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async_handler";
import { getAllDocumentsFromCollection, readData } from "../utils/firebase";
import { privateEncrypt } from "crypto";

interface PageEntry {
  book: string;
  page: string;
  content: string;
}

export const searchString = asyncHandler(
  async (req: Request, res: Response) => {
    const { searchString } = req.body as { searchString: string };

    const jsonPath = path.join(process.cwd(), "assets", "books.json");
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const books: Record<string, Record<string, string>> = JSON.parse(rawData);

    const pages: PageEntry[] = [];

    for (const [bookTitle, bookPages] of Object.entries(books)) {
      for (const [pageNumber, content] of Object.entries(bookPages)) {
        pages.push({
          book: bookTitle,
          page: pageNumber,
          content,
        });
      }
    }

    const fuse = new Fuse(pages, {
      keys: ["content"],
      threshold: 0.3,
    });

    const results = fuse.search(searchString);

    res.json(
      results.map((r) => ({
        book: r.item.book,
        page: r.item.page,
        content: r.item.content,
      }))
    );
  }
);

export const get_books_list = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const data =await getAllDocumentsFromCollection("books");
      if (!data) {
        return res.status(404).json({ message: "No books found" });
      }
      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const get_book = asyncHandler(async (req: Request, res: Response) => {
  const { folder_name } = req.body as { folder_name: string };
  if (!folder_name) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    const bookData =`https://firebasestorage.googleapis.com/v0/b/accupressure-d2905.firebasestorage.app/o/Books%2F${folder_name}_ocr.pdf?alt=media&token=8baedd73-e096-4d13-831d-276630a8b323`
    res.status(200).json(bookData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
