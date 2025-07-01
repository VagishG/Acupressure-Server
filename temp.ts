// import { writeFileSync, appendFileSync, existsSync } from 'fs';
// import fetch from 'node-fetch'; // Uncomment if using node-fetch in older Node.js

// const url = "https://www.acugyan.in/ACUGYAN/ACUGYAN/Home.aspx/GetAutoCompleteData";

// const cookieHeader =
//   "name=9773727714; password=motherboy@50C; _CheckMe=true; ASP.NET_SessionId=m2wmpmy0wfjtxheascpegsnl; __AntiXsrfToken=f3a233393ddf43df8e707099939bd9ec";

// // File where the data will be saved
// const outputFile = 'results.json';

// async function fetchData(letter: string): Promise<any[]> {
//   const postData = { type: 'protocol', searchText: letter };
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Cookie': cookieHeader,
//       },
//       body: JSON.stringify(postData),
//     });

//     const json = await response.json();

//     // Server returns JSON inside a `d` key: { d: [...] }
//     const data = json.d || [];
//     console.log(`Letter "${letter}": received ${data.length} items`);
//     return data;
//   } catch (error) {
//     console.error(`Error for letter "${letter}":`, error);
//     return [];
//   }
// }

// async function main() {
//   const allData: any[] = [];

//   for (let i = 0; i < 26; i++) {
//     const letter = String.fromCharCode(97 + i); // 'a' to 'z'
//     const data = await fetchData(letter);
//     allData.push(...data);
//   }

//   // Save or overwrite the file
//   writeFileSync(outputFile, JSON.stringify(allData, null, 2), 'utf8');
//   console.log(`\n✅ All data written to "${outputFile}" (${allData.length} total items)`);
// }

// main();

// import fs from 'fs';
// import readline from 'readline';

// const inputFile = 'results.json';
// const outputFile = 'unique_results.json';

// async function removeDuplicatesByListId() {
//   const seenIds = new Set<number>();
//   const outputStream = fs.createWriteStream(outputFile);
//   outputStream.write('[\n');

//   const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

//   let first = true;
//   let count = 0;

//   for (const item of data) {
//     const id = item.ListId;

//     if (!seenIds.has(id)) {
//       seenIds.add(id);

//       // Manage commas properly
//       if (!first) outputStream.write(',\n');
//       outputStream.write(JSON.stringify(item, null, 2));

//       first = false;
//       count++;
//     }
//   }

//   outputStream.write('\n]');
//   outputStream.end();

//   console.log(`✅ Done. Kept ${count} unique items (based on ListId).`);
// }

// removeDuplicatesByListId();

// import fs from 'fs';

// const inputFile = 'unique_results.json';
// const outputFile = 'cleaned_results.json';

// const fieldsToRemove = [
//   "sBookList",
//   "ProtocolSource",
//   "IsEditProtocol",
//   "IsDeleteProtocol",
//   "StartPageNumber",
//   "EndPageNumber",
//   "ProtocolType",
//   "BookName",
//   "Protocol",
//   "SubmittedBy_Name",
//   "Submitted_Date",
//   "OtherSource",
//   "Reference",
//   "BookId",
//   "DocumentSystemGeneratedName",
//   "Documents",
// "prorandom",
// "RemarksString",
// "Symptoms_Des",
// "__type",
// "Id"
// ];

// function cleanData() {
//   const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

//   const cleaned = data.map((item: Record<string, any>) => {
//     for (const field of fieldsToRemove) {
//       delete item[field];
//     }
//     return item;
//   });

//   fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2), 'utf8');
//   console.log(`✅ Cleaned data saved to "${outputFile}". Removed ${fieldsToRemove.length} fields from each entry.`);
// }

// cleanData();

// import fs from 'fs';

// const inputFile = 'cleaned_results.json';
// const outputFile = 'parsed_results.json';

// function parseIndexText(indexText: string): { Book?: string; Page?: number } {
//   if (!indexText) return {};

//   // Extract book name (text before "- P" or ":" pattern)
//   const bookMatch = indexText.match(/^(.+?)[\s\-–]*P\d+/i) || indexText.match(/^(.+?)[\s\-–]*:/i);
//   const pageMatch = indexText.match(/P(\d+)/i);

//   const bookRaw = bookMatch?.[1]?.trim();
//     const pageNumber = pageMatch ? parseInt(pageMatch[1], 10) - 1 : undefined;

//   const bookFormatted = bookRaw ? bookRaw.replace(/\s+/g, '_') : undefined;

//   return {
//     Book: bookFormatted,
//     Page: pageNumber
//   };
// }

// function enhanceData() {
//   const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

//   const enhanced = data.map((item: any) => {
//     const { Book, Page } = parseIndexText(item.IndexText || '');

//     return {
//       ...item,
//       Book,
//       Page
//     };
//   });

//   fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2), 'utf8');
//   console.log(`✅ Book and Page extracted. Output written to "${outputFile}".`);
// }

// enhanceData();

import fs from 'fs';
import admin from 'firebase-admin';

// Load your service account key
const serviceAccount = require('./accupressure.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const inputFile = 'parsed_results.json';
const collectionName = 'protocol';

function createSearchableArray(text: string): string[] {
  return Array.from(
    new Set(
      (text || '')
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 1)
    )
  );
}

async function uploadToFirebase() {
  const data: any[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  console.log(`⏳ Uploading ${data.length} items to Firestore collection "${collectionName}"...`);

  let uploaded = 0;

  for (const item of data) {
    const docId = item.ListId.toString();

    // ➕ Add searchableArray from ListText
    item.searchableArray = createSearchableArray(item.ListText || '');

    try {
      await db.collection(collectionName).doc(docId).set(item);
      uploaded++;
    } catch (error) {
      console.error(`❌ Error uploading ListId=${docId}:`, error);
    }
  }

  console.log(`✅ Done. Uploaded ${uploaded} documents to collection "${collectionName}".`);
}

uploadToFirebase();
