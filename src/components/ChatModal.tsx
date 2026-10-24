import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, Listing } from '../types';
import { subscribeToMessages, sendMessage } from '../services/dataService';
import { X, Send, User, CheckCheck, Clock } from 'lucide-react';
import { timeAgo } from '../utils/formatters';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Listing | null;
  receiverId?: string;
  receiverName?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  listing,
  receiverId = listing?.userId || 'seller-default',
  receiverName = listing?.sellerName || 'Agri Seller'
}) => {
  const { currentUser } = useAuth();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute a stable deterministic conversationId based on participants
  const myId = currentUser?.uid || 'guest-farmer';
  const participants = [myId, receiverId].sort();
  const conversationId = `conv_${participants[0]}_${participants[1]}${listing ? `_${listing.id}` : ''}`;

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [isOpen, conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: myId,
      senderName: currentUser?.fullName || (lang === 'ur' ? 'کسان خریدار' : 'Interested Buyer'),
      receiverId,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      listingId: listing?.id,
      listingTitle: listing?.title
    };

    try {
      await sendMessage(newMsg);
      setInputText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1B5E20] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#81C784] text-[#1B5E20] flex items-center justify-center font-bold text-base shadow-sm">
              <User className="w-5 h-5 text-[#1B5E20]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                {receiverName}
              </h3>
              <p className="text-[11px] text-[#A5D6A7]">
                {listing ? listing.title.slice(0, 35) + '...' : (lang === 'ur' ? 'آن لائن رابطہ' : 'Direct Mandi Messaging')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-[#2E7D32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner if applicable */}
        {listing && (
          <div className="bg-[#FFF8E7] px-4 py-2 border-b border-[#FFE082] flex items-center gap-3">
            {listing.images && listing.images[0] && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-10 h-10 rounded-lg object-cover border border-[#F9A825]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{listing.title}</p>
              <p className="text-xs text-[#1B5E20] font-black">
                Rs. {listing.price.toLocaleString()} {listing.isNegotiable && `(${t.negotiable})`}
              </p>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-2">
                <Send className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {lang === 'ur' ? 'براہ راست بات چیت شروع کریں' : 'Start the conversation'}
              </p>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                {lang === 'ur'
                  ? 'قیمت، ترسیل یا معیار کے بارے میں بیچنے والے سے سوال پوچھیں۔'
                  : 'Ask about product availability, quality grade, delivery, or best final price.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === myId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-[#1B5E20] text-white rounded-tr-xs'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-xs'
                    }`}
                  >
                    {!isMine && (
                      <span className="block text-[10px] font-bold text-[#2E7D32] mb-0.5">
                        {msg.senderName}
                      </span>
                    )}
                    <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMine ? 'text-[#C8E6C9]' : 'text-gray-400'
                      }`}
                    >
                      <span>{timeAgo(msg.timestamp, lang === 'ur')}</span>
                      {isMine && <CheckCheck className="w-3.5 h-3.5 text-[#81C784]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              lang === 'ur'
                ? 'اپنا پیغام یہاں لکھیں (مثلاً کیا ریٹ میں کمی ممکن ہے؟)...'
                : 'Type your message (e.g. Is this still available?)...'
            }
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="px-4 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-gray-300 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ur' ? 'ارسال' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
