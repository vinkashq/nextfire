import GenerateImage from "@/components/generate-image";
import ImageGrid from "./image-grid";
import { firestore } from "@/firebase/server";
import { DocumentData } from "firebase/firestore";


export const dynamic = 'force-dynamic'

export default async function Page() {
  const query = firestore.collection("images").orderBy("createdAt", "desc").limit(10)

  const snapshot = await query.get()
  const imagesData = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      url: `/admin/images/${doc.id}.${data.extension}`,
      createdAt: data.createdAt?.toDate?.()?.getTime() || data.createdAt,
    }
  })

  return (
    <div className="flex flex-col gap-4 grow">
      <GenerateImage />
      <ImageGrid images={imagesData} />
    </div>
  )
}
