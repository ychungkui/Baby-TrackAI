import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Send, Trash2 } from 'lucide-react';
import vipBadge from '@/assets/icons/vip-badge.png';
import robotIcon from '@/assets/icons/robot.png';
import robotHeaderIcon from '@/assets/icons/robot-header.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BottomNav } from '@/components/layout/BottomNav';
import { BabySelector } from '@/components/baby/BabySelector';
import { AddBabyDialog } from '@/components/baby/AddBabyDialog'; // 🔥 新增
import { useBabyContext } from '@/contexts/BabyContext';
import { useAiChat, ChatMessage } from '@/hooks/useAiChat';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { HeaderBranding } from '@/components/layout/HeaderBranding';
import { useLanguage } from '@/i18n';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border text-card-foreground rounded-bl-md'}`}>
        {message.content}
      </div>
    </div>
  );
}

export default function Chat() {
  const { session } = useAuth();
  const { currentBaby } = useBabyContext();
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat();
  const { canUseAiChat, remainingChat, isPro, incrementChat } = useUsageLimit();
  const { t, language } = useLanguage();

  const [input, setInput] = useState('');
  const [addBabyOpen, setAddBabyOpen] = useState(false); // 🔥 新增

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const SUGGESTED_QUESTIONS = [
    t('chat.q1'),t('chat.q2'),t('chat.q3'),t('chat.q4'),
    t('chat.q5'),t('chat.q6'),t('chat.q7'),t('chat.q8'),
    t('chat.q9'),t('chat.q10'),t('chat.q11'),t('chat.q12'),
    t('chat.q13'),t('chat.q14'),t('chat.q15'),t('chat.q16')
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!session) return <Navigate to="/auth" replace />;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !currentBaby) return;

    if (!canUseAiChat) {
      navigate('/subscription');
      return;
    }

    setInput('');
    incrementChat();
    sendMessage(trimmed, currentBaby.id, currentBaby.name, currentBaby.birth_date, language);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (isLoading || !currentBaby) return;

    if (!canUseAiChat) {
      navigate('/subscription');
      return;
    }

    incrementChat();
    sendMessage(question, currentBaby.id, currentBaby.name, currentBaby.birth_date, language);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background flex flex-col">
      <header className="sticky top-0 z-40 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">
          <div className="flex justify-center">
            <HeaderBranding className="text-white" />
          </div>

          <div className="flex items-center justify-between">
            <BabySelector
              onAddBaby={() => setAddBabyOpen(true)} // 🔥 修改
              showAddBaby={false}
            />

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              <div className="flex items-center gap-1.5">
                <img src={robotHeaderIcon} alt="AI" className="w-5 h-5" />
                <span className="text-sm font-medium">{t('chat.title')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4 pb-32">
          {showWelcome ? (
            <div className="flex flex-col items-center justify-center pt-12 gap-6">
             <img src={robotIcon} alt="AI" className="w-[200px] h-[200px]" />

              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">{t('chat.welcome')}</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {currentBaby?.name
                    ? t('chat.welcome_desc', { name: currentBaby.name })
                    : t('chat.welcome_desc_default')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full px-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto min-h-[44px] whitespace-normal text-center py-2"
                    onClick={() => handleSuggestionClick(q)}
                    disabled={!currentBaby}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="sticky bottom-16 bg-background border-t border-border px-4 pt-2 pb-3 safe-area-bottom">
        {!canUseAiChat && !isPro ? (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-2">
              {t('chat.free_used_up')}
            </p>
            <Button size="sm" className="gap-1" onClick={() => navigate('/subscription')}>
              <img src={vipBadge} alt="VIP" className="w-3.5 h-3.5" />
              {t('chat.upgrade_pro')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-[10px] text-muted-foreground">
                {t('chat.disclaimer')}
              </p>
              {!isPro && (
                <span className="text-[10px] text-muted-foreground">
                  · {t('chat.remaining', { count: remainingChat })}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentBaby ? t('chat.input_placeholder') : t('chat.select_baby_first')}
                disabled={!currentBaby || isLoading}
                className="flex-1"
              />

              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !currentBaby}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* 🔥 新增 */}
      <AddBabyDialog open={addBabyOpen} onOpenChange={setAddBabyOpen} />

      <BottomNav />
    </div>
  );
}