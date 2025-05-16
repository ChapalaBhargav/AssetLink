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
      await setDoc(conflictRef, {
        assetId,
        userIds,
        timestamp: new Date(),
      });
    } else {
      await deleteDoc(conflictRef).catch(() => {
      });
    }
  }
}
