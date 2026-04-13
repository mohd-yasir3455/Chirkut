// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook to fetch documents from a collection
 */
export const useCollection = (collectionName, orderByField = null) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    try {
      let q = collection(db, collectionName);
      
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName]);

  return { documents, loading, error };
};

/**
 * Hook to add a document
 */
export const useAddDocument = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDocument = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setLoading(false);
      return docRef.id;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { addDocument, loading, error };
};

/**
 * Hook to update a document
 */
export const useUpdateDocument = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDocument = async (docId, data) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        editedAt: serverTimestamp(),
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { updateDocument, loading, error };
};

/**
 * Hook to delete a document
 */
export const useDeleteDocument = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteDocument = async (docId) => {
    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, collectionName, docId));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { deleteDocument, loading, error };
};

/**
 * Hook to fetch a single document
 */
export const useDocument = (collectionName, docId) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        doc(db, collectionName, docId),
        (snapshot) => {
          if (snapshot.exists()) {
            setDocument({ id: snapshot.id, ...snapshot.data() });
          } else {
            setDocument(null);
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { document, loading, error };
};

/**
 * Hook to fetch total thank you count
 */
export const useTotalCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const docRef = doc(db, 'config', 'main');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setCount(snapshot.data().totalThankyouCount || 0);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching count:', err);
        setLoading(false);
      }
    };

    fetchCount();

    // Real-time updates
    const unsubscribe = onSnapshot(doc(db, 'config', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setCount(snapshot.data().totalThankyouCount || 0);
      }
    });

    return unsubscribe;
  }, []);

  return { count, loading };
};

/**
 * Hook to update total count
 */
export const useUpdateCount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCount = async (newCount) => {
    setLoading(true);
    setError(null);

    try {
      const configRef = doc(db, 'config', 'main');
      await updateDoc(configRef, {
        totalThankyouCount: newCount,
        lastUpdated: serverTimestamp(),
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { updateCount, loading, error };
};
