// write.ts
import { privateEncrypt } from 'crypto';
import { db } from '../firebase';


/**
 * Write data to Firestore
 * @param collectionName - Firestore collection name
 * @param docId - Optional document ID. If not provided, Firestore will auto-generate.
 * @param data - The JSON data to store
 * @returns The document reference
 */
export async function writeData<T extends object>(
  collectionName: string,
  docId: string | null,
  data: T
) {
  const collectionRef = db.collection(collectionName);

  let docRef;
  if (docId) {
    docRef = collectionRef.doc(docId);
    await docRef.set(data);
  } else {
    docRef = await collectionRef.add(data);
  }

  console.log(`Document written to '${collectionName}'${docId ? ` with ID: ${docId}` : ''}`);
  return docRef;
}

/**
 * Read a document from Firestore
 * @param collectionName - The Firestore collection name
 * @param docId - The document ID to read
 * @returns The document data or null if not found
 */
export async function readData<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = db.collection(collectionName).doc(docId);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    console.log(`No document found in '${collectionName}' with ID: ${docId}`);
    return null;
  }

  const data = snapshot.data() as T;
  console.log(`Document read from '${collectionName}' with ID: ${docId}`);
  return data;
}

export async function getAllDocumentsFromCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();

  const documents = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return documents;
}


/**
 * Search documents in a collection by a field value.
 * @param collectionName - The Firestore collection name
 * @param field - The field to filter by
 * @param operator - Firestore query operator (==, <, <=, >, >=, etc.)
 * @param value - The value to match
 * @returns An array of matched documents
 */
export async function searchCollection<T>(
  collectionName: string,
  field: string,
  operator: FirebaseFirestore.WhereFilterOp,
  value: any
): Promise<(T & { id: string })[]> {
  const snapshot = await db
    .collection(collectionName)
    .where(field, operator, value)
    .get();

  const results: (T & { id: string })[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data() as T;
    results.push({ ...data, id: doc.id }); // Include the document ID
  });

  console.log(
    `Found ${results.length} document(s) in '${collectionName}' where ${field} ${operator} ${value}`
  );

  return results;
}


export async function searchProtocol(searchText: string): Promise<any[]> {
  if (!searchText) {
    throw new Error('Search text is required');
  }

  const snapshot = await db
    .collection('protocol')
    .where('searchableArray', 'array-contains', searchText.toLowerCase())
    .get();

  const results = snapshot.docs.map(doc => doc.data());

  console.log(`🔍 Found ${results.length} document(s) in 'protocol' where searchableArray contains '${searchText}'`);
  return results;
}