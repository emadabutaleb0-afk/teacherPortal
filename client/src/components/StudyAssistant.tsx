import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, Loader2, Bot, User } from 'lucide-react';
import { mockStudyAssistantResponses } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function StudyAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI Study Assistant. I'm here to help you understand difficult topics, break down concepts, and answer your homework questions. What would you like to learn about today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string = input) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmedText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Generate response based on matched topic or random fallback
    const lowerText = trimmedText.toLowerCase();
    let matchedResponse = mockStudyAssistantResponses[0]; // fallback default

    if (lowerText.includes('photosynthesis')) {
      matchedResponse = mockStudyAssistantResponses.find(r => r.topic === 'Photosynthesis') || matchedResponse;
    } else if (lowerText.includes('fraction')) {
      matchedResponse = mockStudyAssistantResponses.find(r => r.topic === 'Fractions') || matchedResponse;
    } else if (lowerText.includes('essay')) {
      matchedResponse = mockStudyAssistantResponses.find(r => r.topic === 'Essay Writing') || matchedResponse;
    } else if (lowerText.includes('algebra') || lowerText.includes('equation')) {
      matchedResponse = mockStudyAssistantResponses.find(r => r.topic === 'Algebra') || matchedResponse;
    } else {
      // Pick a random study assistant response from the database
      const randomIdx = Math.floor(Math.random() * mockStudyAssistantResponses.length);
      matchedResponse = mockStudyAssistantResponses[randomIdx];
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: matchedResponse.response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const suggestedQuestions = [
    'Explain photosynthesis simply',
    'How do I solve fractions?',
    'What are the steps to write a good essay?',
    'How do I solve algebra equations?',
  ];

  return (
    <Card className="h-full flex flex-col rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden animate-scale-in">
      <CardHeader className="border-b border-border bg-muted/15 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight">AI Study Buddy</CardTitle>
            <CardDescription className="text-xs">Your personal tutor & helper</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 bg-background/30">
        {/* Messages list with scroll area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <AnimatePresence initial={false}>
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for assistant */}
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center border border-primary/20 text-primary shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      message.type === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-muted/75 dark:bg-muted text-foreground rounded-tl-none border border-border/40'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  <span className={`text-[10px] text-muted-foreground mt-1 px-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Avatar for user */}
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex-shrink-0 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator spinner */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted/75 dark:bg-muted px-4 py-3 rounded-2xl rounded-tl-none border border-border/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (collapses once a conversation starts beyond initial greeting) */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 py-3 border-t border-border/60 bg-muted/10">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Questions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSendMessage(question);
                  }}
                  className="text-left text-xs p-2.5 rounded-xl border border-border/45 hover:border-primary/45 bg-card hover:bg-muted/20 active-scale text-foreground transition-all truncate"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Box */}
        <div className="border-t border-border/60 p-3 bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60 transition-all"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="w-9 h-9 rounded-xl flex-shrink-0 bg-primary hover:bg-primary/95 text-white shadow shadow-primary/15 hover-lift active-scale"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
