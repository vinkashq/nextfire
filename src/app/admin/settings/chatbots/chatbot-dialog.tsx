'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Model, PromptType } from '@/types/ai/chat';
import { useState, useEffect } from 'react';
import { addChatbot, updateChatbot } from '@/app/actions/chatbots';
import { toast } from 'sonner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import PromptTypeInput from '@/components/ai/chat/prompt-type-input';

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot?: Model | null;
  onSuccess?: () => void;
}

export function ChatbotDialog({
  open,
  onOpenChange,
  chatbot,
  onSuccess,
}: ChatbotDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Model>>({
    name: '',
    promptType: 1,
    provider: 1,
  });

  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name,
        promptType: chatbot.promptType,
        provider: chatbot.provider,
      });
    } else {
      setFormData({
        name: '',
        promptType: 1,
        provider: 1,
      });
    }
  }, [chatbot, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (chatbot) {
        await updateChatbot(chatbot.id, formData);
        toast.success('Chatbot updated successfully');
      } else {
        await addChatbot(formData as Omit<Model, 'id'>);
        toast.success('Chatbot added successfully');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{chatbot ? 'Edit Chatbot' : 'Add Chatbot'}</DialogTitle>
          <DialogDescription>
            {chatbot
              ? 'Make changes to the chatbot here.'
              : 'Add a new chatbot to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <PromptTypeInput promptType={formData.promptType} setPromptType={(type) => setFormData({ ...formData, promptType: type })} />
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
