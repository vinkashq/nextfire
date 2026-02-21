"use server"

import { firestore } from "@/firebase/server";
import { bucket } from "@/firebase/server/storage";
import { unstable_cache } from "next/cache";

const getCachedImageData = unstable_cache(
  async (id: string) => {
    const imageRef = firestore.collection("images").doc(id);
    const imageDoc = await imageRef.get()
    if (!imageDoc.exists) {
      return null;
    }
    const data = imageDoc.data();
    return data ? { storagePath: data.storagePath } : null;
  },
  ["image-metadata"],
  { revalidate: 3600, tags: ["image-metadata"] }
);

export const getImageResponse = async (id: string) => {
  const imageData = await getCachedImageData(id);
  if (!imageData) {
    return new Response("Image doc not found in database", { status: 404 });
  }

  const imagePath: string = imageData.storagePath
  if (!imagePath) {
    return new Response("Image path not found", { status: 404 });
  }

  const image = bucket.file(imagePath);
  const [metadata] = await image.getMetadata();
  const stream = image.createReadStream();

  const headers = new Headers({
    "Content-Type": metadata.contentType || "application/octet-stream",
    "Cache-Control": "public, max-age=3600",
  });

  return new Response(stream as any, { headers });
}
