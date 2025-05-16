// src/utils.js
import { collection, doc, setDoc, getDocs } from "./firebase";
import { deleteDoc } from "firebase/firestore";



export async function syncConflicts(db) {
  const assetsCol = collection(db, "assets");
  const assetsSnap = await getDocs(assetsCol);

  for (const assetDoc of assetsSnap.docs) {
    const assetData = assetDoc.data();
    const { assetId, userIds } = assetData;

    const conflictRef = doc(db, "conflicts", assetId);

    if (userIds.length > 1) {
      // Conflict: multiple users registered the same asset
      await setDoc(conflictRef, {
        assetId,
        userIds,
        timestamp: new Date(),
      });
    } else {
      // No conflict, remove conflict document if it exists
      await deleteDoc(conflictRef).catch(() => {
        // Ignore error if doc does not exist
      });
    }
  }
}
