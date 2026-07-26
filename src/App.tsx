import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Conversation } from '@/types/chat';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import WelcomeScreen from '@/components/WelcomeScreen';
import ThemeToggle from '@/components/ThemeToggle';
import UsernameSetup from '@/components/UsernameSetup';
import { sendMessageToAIStreamed, sendMessageToAI } from '@/utils/ai';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from "@/lib/supabase";


let messageCounter = 0;
const generateId = () => `msg-${Date.now()}-${++messageCounter}`;
const generateConversationId = () => `conv-${Date.now()}-${++messageCounter}`;

type AIStatus = 'loading' | 'ready' | 'error';

export default function App() {
  const { name: userName, isNew: isNewProfile } = useProfile();
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Thinking...');
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>('loading');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);
  
  async function loadConversations() {
    const { data: conversationsData, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(error);
      return;
    }
  
    const loaded: Conversation[] = [];
  
    for (const conv of conversationsData) {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
  
      loaded.push({
        id: conv.id,
        title: conv.title,
        createdAt: new Date(conv.created_at),
        messages:
          messagesData?.map((msg) => ({
            id: String(msg.id),
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.created_at),
          })) || [],
      });
    }
  
    setConversations(loaded);
  
  const savedId = localStorage.getItem("activeConversationId");

if (savedId === "new") {
  setActiveConversationId(null);
} else if (savedId && loaded.some(c => c.id === savedId)) {
  setActiveConversationId(savedId);
} else {
  setActiveConversationId(null);
}
  }
  

  // Show username setup when new profile detected
  useEffect(() => {
    if (isNewProfile) setShowUsernameSetup(true);
  }, [isNewProfile]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    localStorage.setItem(
      "activeConversationId",
      activeConversationId ?? "new"
    );
  }, [activeConversationId]);

  // Wait for puter.js
  useEffect(() => {
    let tries = 0;
    const maxTries = 75;
    const timer = setInterval(() => {
      tries++;
      if ((window as any).puter?.ai) {
        setAiStatus('ready');
        clearInterval(timer);
      } else if (tries >= maxTries) {
        setAiStatus('error');
        clearInterval(timer);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const createNewConversation = () => {
    setActiveConversationId(null);
    setSidebarOpen(false);
    setError(null);
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    setError(null);

    console.log("Send message called");

    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    let conversationId = activeConversationId;
    let priorMessages: Message[] = [];

    if (!conversationId) {
      const newConversation: Conversation = {
        id: generateConversationId(),
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [userMessage, assistantMessage],
        createdAt: new Date(),
      };


      
      setConversations((prev) => [newConversation, ...prev]);
      try {
        // Save conversation
        const { error: convError } = await supabase
          .from("conversations")
          .insert({
            id: newConversation.id,
            title: newConversation.title,
          });
      
        if (convError) {
          console.error(convError);
        }
      
        // Save first user message
        const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: newConversation.id,
          role: "user",
          content,
        })
        .select();
      
      console.log("Inserted message:", data);
      
      if (error) {
        console.error("Message insert error:", error);
      }
      } catch (err) {
        console.error(err);
      }

      conversationId = newConversation.id;
      priorMessages = [];
      setActiveConversationId(conversationId);
    } else {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content,
    });
      priorMessages = activeConversation?.messages ?? [];
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
            : conv
        )
      );
    }

    setIsLoading(true);
    setLoadingLabel('Fetching live data...');

    const history = priorMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const finalConvId = conversationId;
    const assistantId = assistantMessage.id;

    try {
      let aiResponse = "";
    
      const success = await sendMessageToAIStreamed(
        content,
        history,
        (fullText) => {
          aiResponse = fullText;
      
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id !== finalConvId
                ? conv
                : {
                    ...conv,
                    messages: conv.messages.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: fullText }
                        : m
                    ),
                  }
            )
          );
        }
      );
      
      if (!success) {
        throw new Error("AI request failed");
      }
    
        setLoadingLabel("Generating...");
    
        // Sirf pehle message par title generate karo
        if (priorMessages.length === 0) {
          const title = await sendMessageToAI(
            `Generate a short chat title (maximum 4 words).
        Return ONLY the title.
        
        User: ${content}
        Assistant: ${aiResponse}`,
            []
          );
        
          await supabase
            .from("conversations")
            .update({ title })
            .eq("id", finalConvId);
        
          setConversations(prev =>
            prev.map(conv =>
              conv.id === finalConvId
                ? { ...conv, title }
                : conv
            )
          );
        }

      
    
      if (error) {
        console.error("Assistant message insert error:", error);
      }
    
    }  catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== finalConvId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === assistantId
                ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' }
                : m
            ),
          };
        })
      );
    } finally {
      setIsLoading(false);
      setLoadingLabel('Thinking...');
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    setError(null);
  };

  // Sidebar action handlers
  const handleRename = async (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id
          ? { ...conv, title: newTitle }
          : conv
      )
    );
  
    const { error } = await supabase
      .from("conversations")
      .update({ title: newTitle })
      .eq("id", id);
  
    if (error) {
      console.error(error);
    }
  };

  const handlePin = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv))
    );
  };
  const handleArchive = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, isArchived: !conv.isArchived } : conv))
    );
    if (activeConversationId === id) setActiveConversationId(null);
  };
  const handleDelete = async (id: string) => {
    // Delete all messages
    const { error: msgError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", id);
  
    if (msgError) {
      console.error(msgError);
      return;
    }
  
    // Delete conversation
    const { error: convError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);
  
    if (convError) {
      console.error(convError);
      return;
    }
  
    // Update UI
    setConversations(prev => prev.filter(conv => conv.id !== id));
  
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar — collapsed by default */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={createNewConversation}
        onRenameConversation={handleRename}
        onPinConversation={handlePin}
        onArchiveConversation={handleArchive}
        onDeleteConversation={handleDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        userName={userName}
        onChangeName={() => setShowUsernameSetup(true)}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 shadow-sm dark:shadow-none">
          {/* Open sidebar button — always visible */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-lg p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
            </svg>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30">
              <span className="text-white text-lg leading-none">✨</span>
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">ChatBot AI</h1>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <button
              onClick={createNewConversation}
              title="New conversation"
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New chat</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </header>

        {/* Loading banner */}
        {aiStatus === 'loading' && (
          <div className="flex shrink-0 items-center justify-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-xs text-yellow-700 dark:text-yellow-400">
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting to AI — please wait…
          </div>
        )}

        {/* Message area */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 pb-8">
          {messages.length === 0 ? (
             <WelcomeScreen onSuggestionClick={handleSendMessage} />
          ) : (
            <div className="pb-4">
              {messages.map((message, idx) => {
                const isLast = idx === messages.length - 1;
                const isAssistantStreaming =
                  isLoading && isLast && message.role === 'assistant' && message.content.trim() === '';

                // During "fetching data" phase (no text yet), show a thinking bubble instead of an empty ChatMessage
                if (isAssistantStreaming) {
                  return <TypingIndicator key={message.id} label={loadingLabel} />;
                }

                // Skip rendering messages with empty content — but only when streaming has already started (a ChatMessage with no content yet)
                if (isLast && message.role === 'assistant' && message.content.trim() === '') {
                  return null;
                }

                 return <ChatMessage key={message.id} message={message} userName={userName} />;
               })}

               {error && (
                <div className="flex justify-center px-4 py-4">
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-3 text-sm max-w-md shadow-sm">
                    <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">Error</p>
                      <p className="text-xs mt-0.5 text-red-600 dark:text-red-300">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="mt-1.5 text-xs text-red-500 dark:text-red-400 underline underline-offset-2 hover:no-underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={aiStatus === 'error'}
          placeholder={
            aiStatus === 'loading'
              ? 'Waiting for AI to load...'
              : aiStatus === 'error'
              ? 'AI is offline. Please reload.'
              : 'Ask anything...'
          }
        />
      </main>

      {/* Username setup modal — shown at first launch */}
      {showUsernameSetup && (
        <UsernameSetup onDone={() => setShowUsernameSetup(false)} />
      )}
    </div>
  );
}
