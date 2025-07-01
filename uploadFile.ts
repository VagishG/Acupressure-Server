// const bookMappings = {
//   "1_Point_Treatment_for_Old_Age_Problems": "1 Point Treatment for Old Age Problems",
//   "Aatray": "Aatray",
//   "Bharadwaj": "Bharadwaj",
//   "Charak1": "Charak 1",
//   "Charak2": "Charak 2",
//   "Charak3": "Charak 3",
//   "Children_Health_Guide": "Children Health Guide",
//   "Chyawan_Vol-2": "Chyawan Vol 2",
//   "CM_in_AM_Vol-1": "CM in AM Vol 1",
//   "CM_in_AM_Vol-2": "CM in AM Vol 2",
//   "Colour_Therapy_Vol-1": "Colour Therapy Vol 1",
//   "Colour_Therapy_Vol-2": "Colour Therapy Vol 2",
//   "Constipation_-_Ayurvedic_Acu": "Constipation - Ayurvedic Acu",
//   "Dhanwantri": "Dhanwantri",
//   "Female_Disorders_-_Ayurvedic_Acu": "Female Disorders - Ayurvedic Acu",
//   "Female_Disorders_-_Chinese_Acu": "Female Disorders - Chinese Acu",
//   "Hippocratus1": "Hippocratus 1",
//   "Hippocratus2": "Hippocratus 2",
//   "Maget_Theraphy_Vol-2": "Magnet Therapy Vol 2",
//   "One_point_Treatment_Book-1": "One Point Treatment Book 1",
//   "One_point_Treatment_Book-2": "One Point Treatment Book 2",
//   "Sushrut_Case_Manual_1": "Sushrut Case Manual 1",
//   "Sushrut_Case_Manual_2": "Sushrut Case Manual 2",
//   "Sushrut_Case_Manual_3": "Sushrut Case Manual 3",
//   "Susruta_Rang_Chikithsa": "Susruta Rang Chikithsa",
//   "Treatise_1": "Treatise 1",
//   "Treatise_2": "Treatise 2",
//   "Treatise_3": "Treatise 3",
//   "Treatise_4": "Treatise 4",
//   "Treatise_5": "Treatise 5",
//   "Treatise_6": "Treatise 6",
//   "Treatise_7": "Treatise 7",
//   "Treatise_8": "Treatise 8",
//   "Treatise_9": "Treatise 9",
//   "Treatise_10": "Treatise 10",
//   "Treatise_11": "Treatise 11",
//   "Treatise_12": "Treatise 12",
//   "Treatise_13": "Treatise 13",
//   "Treatise_14": "Treatise 14",
//   "Treatise_15": "Treatise 15",
//   "Treatise_16": "Treatise 16",
//   "Treatise_17": "Treatise 17",
//   "Treatise_18": "Treatise 18",
//   "Treatise_19": "Treatise 19",
//   "Treatise_20": "Treatise 20",
//   "Treatise_21": "Treatise 21",
//   "Treatise_22": "Treatise 22",
//   "Treatise_23": "Treatise 23",
//   "Treatise_24": "Treatise 24",
//   "Treatment_Hand_Book-Vol-3": "Treatment Hand Book Vol 3"
// };

// import { db } from "./src/firebase"; // update to your actual Firebase import path

// async function uploadBooks() {
//   const collectionRef = db.collection("books");

//   for (const [folderName, title] of Object.entries(bookMappings)) {
//     const bookData = {
//       folderName,
//       title,
//       createdAt: new Date()
//     };

//     // Use folder name as doc ID (optional)
//     await collectionRef.doc(folderName).set(bookData);
//     console.log(`Uploaded: ${folderName} → ${title}`);
//   }

//   console.log("✅ All books uploaded to Firestore!");
// }

// uploadBooks().catch(console.error);
import admin from "firebase-admin";
import fs from "fs-extra";
import path from "path";
import mime from "mime";

// Load Firebase service account
const serviceAccount = require("./accupressure.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
    storageBucket: "accupressure-d2905.firebasestorage.app",
});

const bucket = admin.storage().bucket();
const BOOKS_DIR = path.join(__dirname, "Pages");

async function uploadFile(filePath: string, destination: string): Promise<void> {
  const contentType = mime.getType(filePath) || undefined;

  await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType,
    },
  });

  console.log(`✅ Uploaded: ${destination}`);
}

async function uploadAllBooks() {
  const bookFolders = await fs.readdir(BOOKS_DIR);

  for (const folder of bookFolders) {
    const fullFolderPath = path.join(BOOKS_DIR, folder);
    const stat = await fs.stat(fullFolderPath);

    if (!stat.isDirectory()) continue;

    const imageFiles = await fs.readdir(fullFolderPath);

    for (const imageFile of imageFiles.sort()) {
      const localPath = path.join(fullFolderPath, imageFile);
      const firebasePath = `Pages/${folder}/${imageFile}`;
      await uploadFile(localPath, firebasePath);
    }
  }

  console.log("🎉 All books uploaded to Firebase Storage.");
}

uploadAllBooks().catch(console.error);
