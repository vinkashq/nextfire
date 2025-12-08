"use client"

import { Crud, CrudForm, CrudFormType } from "@/components/ui/crud";
import { Model } from "@/types/ai/chat";
import { columns } from "./columns";
import { useState } from "react";
import { createAiModel, deleteAiModel, updateAiModel } from "@/app/actions/ai-models";
import { Label } from "@/components/ui/label";
import PromptTypeInput from "@/components/ai/chat/prompt-type-input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AiModelsCrud({ models }: { models: Model[] }) {
  const defaultModel = {
    id: '',
    name: '',
    provider: 1,
    title: '',
    promptType: 1,
  }
  const formState = useState<CrudFormType<Model>>({
    method: 'create',
    data: defaultModel
  })
  const [formType, setFormType] = formState
  const formData = formType.data
  const setFormData = (data: Model) => setFormType({ ...formType, data })

  const onCreate = (data: Model) => {
    createAiModel(data)
  }

  const onEdit = (data: Model) => {
    updateAiModel(data)
  }

  const onDelete = (data: Model) => {
    deleteAiModel(data)
  }

  return (
    <Crud
      name="AI Model"
      columns={columns}
      data={models}
      formState={formState}
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      defaultData={defaultModel}
    >
      <CrudForm>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <PromptTypeInput promptType={formData.promptType} setPromptType={(type) => setFormData({ ...formData, promptType: type })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Select
              value={formData.provider?.toString()}
              required
              onValueChange={(value) => setFormData({ ...formData, provider: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>AI Providers</SelectLabel>
                  <SelectItem value="1">Google</SelectItem>
                  <SelectItem value="2">OpenAI</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
      </CrudForm>
    </Crud>
  );
}