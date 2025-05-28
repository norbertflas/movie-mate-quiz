
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Volume2, Users, MessageCircle, Settings, Share2 } from "lucide-react";
import { WatchParty, WatchPartyParticipant, ChatMessage } from "../types/SocialTypes";

interface WatchPartyComponentProps {
  watchParty: WatchParty;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onControlVideo: (action: 'play' | 'pause' | 'seek', time?: number) => void;
  onLeaveParty: () => void;
}

export const WatchPartyComponent: React.FC<WatchPartyComponentProps> = ({
  watchParty,
  currentUserId,
  onSendMessage,
  onControlVideo,
  onLeaveParty
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [videoTime, setVideoTime] = useState(watchParty.currentTime);
  
  const currentUser = watchParty.participants.find(p => p.userId === currentUserId);
  const isHost = currentUser?.isHost || false;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
                     : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={`https://image.tmdb.org/t/p/w92${watchParty.moviePoster}`}
            alt={watchParty.movieTitle}
            className="w-12 h-16 object-cover rounded"
          />
          <div>
            <h1 className="text-xl font-bold">{watchParty.movieTitle}</h1>
            <p className="text-gray-400">Hosted by {watchParty.hostName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{watchParty.participants.length}</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={onLeaveParty}>
            Leave Party
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player Placeholder */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{watchParty.movieTitle}</h3>
              <p className="text-gray-400">Video player would be embedded here</p>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-4 left-4">
              <Badge variant={watchParty.isPlaying ? "default" : "secondary"}>
                {watchParty.isPlaying ? "Playing" : "Paused"}
              </Badge>
            </div>
          </div>

          {/* Video Controls */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isHost && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onControlVideo(watchParty.isPlaying ? 'pause' : 'play')}
                    >
                      {watchParty.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <span className="text-sm text-gray-400">
                  {formatTime(videoTime)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Button>
                {isHost && (
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 350 }}
            className="bg-gray-900 border-l border-gray-800 flex flex-col"
          >
            {/* Participants */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Participants ({watchParty.participants.length})
              </h3>
              <div className="space-y-2">
                {watchParty.participants.slice(0, 5).map((participant) => (
                  <div key={participant.userId} className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={participant.userAvatar} />
                      <AvatarFallback>{participant.userName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{participant.userName}</span>
                    {participant.isHost && (
                      <Badge variant="secondary" className="text-xs">Host</Badge>
                    )}
                  </div>
                ))}
                {watchParty.participants.length > 5 && (
                  <p className="text-xs text-gray-400">
                    +{watchParty.participants.length - 5} more
                  </p>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {watchParty.chatMessages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      <Avatar className="w-6 h-6 mt-1">
                        <AvatarImage src={message.userAvatar} />
                        <AvatarFallback>{message.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{message.userName}</span>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border-gray-700"
                  />
                  <Button type="submit" size="sm">
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
