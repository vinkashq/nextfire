import { listAiModels } from '@/app/actions/ai-models';
import AiModelsCrud from './crud';

export default async function Page() {
  const models = await listAiModels()

  return (
    <div className="grow container mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Models</h1>
      <AiModelsCrud models={models} />
    </div>
  )
}