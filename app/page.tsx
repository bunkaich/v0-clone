'use client';
import { useState } from 'react';
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from '@/components/ai-elements/web-preview';
import { Message, MessageContent } from '@/components/ai-elements/message';

export default function Home() {
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async (promptMessage) => {
    const userMessage = promptMessage.text?.trim() || 'Sent with attachments';
    setMessage('');
    setIsLoading(true);
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, chatId: currentChat?.id }),
      });
      const chat = await response.json();
      setCurrentChat(chat);
      setChatHistory(prev => [...prev, { type: 'assistant', content: 'Generated new app preview!' }]);
    } catch {
      setChatHistory(prev => [...prev, { type: 'assistant', content: 'Error creating app.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Chat panel */}
      <div className="w-1/2 flex flex-col border-r">
        <Conversation>
          <ConversationContent>
            {chatHistory.map((msg, i) => (
              <Message from={msg.type} key={i}>
                <MessageContent>{msg.content}</MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
        <PromptInput onSubmit={handleSendMessage}>
          <PromptInputTextarea value={message} onChange={(e) => setMessage(e.target.value)} />
          <PromptInputSubmit status={isLoading ? 'streaming' : 'ready'} />
        </PromptInput>
      </div>

      {/* Preview panel */}
      <div className="w-1/2">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl value={currentChat?.demo} readOnly />
          </WebPreviewNavigation>
          <WebPreviewBody src={currentChat?.demo} />
        </WebPreview>
      </div>
    </div>
  );
}
