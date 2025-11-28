import { useState, useEffect, useRef } from "react";
import { trpc } from "../lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Mensagens() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: conversations, refetch: refetchConversations } = trpc.messages.listConversations.useQuery();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const { data: messages, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );
  const sendMessageMutation = trpc.messages.send.useMutation();
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      // Marcar mensagens como lidas
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId || !selectedConversation) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        receiverId: selectedConversation.otherUser.id,
        content: messageText,
      });

      setMessageText("");
      await refetchMessages();
      await refetchConversations();
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      console.error(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mensagens...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
        <p className="text-gray-600 mt-2">
          Converse com produtores e proprietários
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Sidebar - Lista de Conversas */}
        <Card className="border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversationId === conversation.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherUser.avatarUrl || undefined} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getInitials(conversation.otherUser.name || "US")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.otherUser.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                              {format(new Date(conversation.lastMessage.createdAt), 'HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-1">Nenhuma conversa ainda</p>
                <p className="text-sm text-gray-400">
                  Suas conversas aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:col-span-2 border-gray-200 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.otherUser.avatarUrl || undefined} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {getInitials(selectedConversation.otherUser.name || "US")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedConversation.otherUser.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage = message.senderId === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(message.createdAt), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma mensagem ainda</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Envie a primeira mensagem
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Selecione uma conversa</p>
                <p className="text-sm text-gray-400 mt-1">
                  Escolha uma conversa na lista ao lado
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
