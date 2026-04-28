import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    content: string,
    babyId: string,
    babyName?: string,
    babyBirthDate?: string,
    language?: string
  ) => {
    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: updatedMessages,
          babyId,
          babyName,
          babyBirthDate,
          language,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
