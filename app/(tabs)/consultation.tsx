import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import {
  Phone,
  Star,
  Bot,
  Video,
  Calendar,
  Clock,
  Send,
  X,
} from '@/utils/icons';
import { dermatologists, Dermatologist } from '@/assets/data/consultations';
import { LinearGradient } from 'expo-linear-gradient';
import { chatWithAI, Message } from '@/services/AzureAIService';
import React from 'react';

type ConsultationType = 'chat' | 'call' | 'video';

export default function ConsultationScreen() {
  const [consultationType, setConsultationType] =
    useState<ConsultationType>('chat');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(newMessages);
      const aiMessage: Message = {
        role: 'assistant',
        content: response || 'Sorry, I could not generate a response.',
      };
      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error. Please try again.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = () => {
    setShowChat(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            "Hello! I'm your AI skincare assistant. How can I help you today?",
        },
      ]);
    }
  };

  const closeChat = () => {
    setShowChat(false);
  };

  // Simple Chat Interface
  if (showChat) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={closeChat} style={styles.closeBtn}>
              <X size={24} color={Colors.neutral.white} />
            </TouchableOpacity>
            <Typography variant="h3" style={styles.chatTitle}>
              AI Assistant
            </Typography>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesArea}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  msg.role === 'user' ? styles.userRow : styles.aiRow,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Typography
                    variant="body"
                    color={
                      msg.role === 'user'
                        ? Colors.neutral.white
                        : Colors.text.primary
                    }
                  >
                    {msg.content}
                  </Typography>
                </View>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageRow, styles.aiRow]}>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Typography variant="body" color={Colors.text.secondary}>
                    Typing...
                  </Typography>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { opacity: inputText.trim() && !isLoading ? 1 : 0.5 },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color={Colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const renderConsultationOption = (
    type: ConsultationType,
    label: string,
    icon: React.ReactNode
  ) => {
    const isSelected = consultationType === type;
    const borderColor = isSelected
      ? type === 'chat'
        ? '#8B4513'
        : Colors.primary.default
      : Colors.neutral.lightest;
    const bgColor = isSelected
      ? type === 'chat'
        ? '#D2B48C'
        : Colors.primary.light
      : Colors.neutral.lightest;
    const textColor = isSelected
      ? type === 'chat'
        ? '#8B4513'
        : Colors.primary.default
      : Colors.text.secondary;

    return (
      <TouchableOpacity
        style={[
          styles.consultationOption,
          isSelected && styles.selectedConsultation,
          { borderBottomColor: borderColor },
        ]}
        onPress={() => {
          setConsultationType(type);
          if (type === 'chat') {
            openChat();
          }
        }}
      >
        <View
          style={[
            styles.consultationIconContainer,
            isSelected && styles.selectedConsultationIcon,
            { backgroundColor: bgColor },
          ]}
        >
          {icon}
        </View>
        <Typography
          variant="bodySmall"
          color={textColor}
          style={styles.consultationLabel}
        >
          {label}
        </Typography>
      </TouchableOpacity>
    );
  };

  const renderDermatologistCard = ({ item }: { item: Dermatologist }) => (
    <Card style={styles.dermatologistCard} elevation={1}>
      <View style={styles.dermatologistHeader}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.dermatologistImage}
        />

        {!item.available && (
          <View style={styles.unavailableBadge}>
            <Typography variant="caption" color={Colors.neutral.white}>
              Unavailable
            </Typography>
          </View>
        )}

        <View style={styles.dermatologistInfo}>
          <Typography variant="h4" style={styles.dermatologistName}>
            {item.name}
          </Typography>

          <Typography variant="bodySmall" style={styles.dermatologistSpecialty}>
            {item.specialty}
          </Typography>

          <View style={styles.dermatologistStats}>
            <View style={styles.ratingContainer}>
              <Star size={16} color={Colors.warning.default} />
              <Typography variant="caption" style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </Typography>
            </View>

            <Typography variant="caption" style={styles.experienceText}>
              {item.yearsExperience} years exp.
            </Typography>
          </View>
        </View>
      </View>

      <Typography variant="bodySmall" style={styles.dermatologistBio}>
        {item.bio}
      </Typography>

      <View style={styles.availabilityContainer}>
        <View style={styles.availabilityTime}>
          <View style={styles.availabilityIcon}>
            <Calendar size={16} color={Colors.primary.default} />
          </View>
          <Typography variant="caption">Next available: Today</Typography>
        </View>

        <View style={styles.availabilityTime}>
          <View style={styles.availabilityIcon}>
            <Clock size={16} color={Colors.primary.default} />
          </View>
          <Typography variant="caption">At 3:30 PM</Typography>
        </View>
      </View>

      <Button
        label={
          consultationType === 'chat'
            ? 'Start Chat'
            : consultationType === 'call'
            ? 'Schedule Call'
            : 'Schedule Video'
        }
        variant={item.available ? 'primary' : 'outline'}
        size="md"
        fullWidth
        disabled={!item.available}
        style={styles.consultButton}
        onPress={() => {
          /* Handle consultation */
        }}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.secondary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h2">Consultation</Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            Get expert advice from dermatologists
          </Typography>
        </View>

        <View style={styles.consultationTypes}>
          {renderConsultationOption(
            'chat',
            'AI Chat',
            <Bot
              size={24}
              color={
                consultationType === 'chat'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            />
          )}
          {renderConsultationOption(
            'call',
            'Voice Call',
            <Phone
              size={24}
              color={
                consultationType === 'call'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            />
          )}
          {renderConsultationOption(
            'video',
            'Video Call',
            <Video
              size={24}
              color={
                consultationType === 'video'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            />
          )}
        </View>

        <View style={styles.content}>
          {consultationType === 'chat' ? (
            <View style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyStateTitle}>
                AI Skincare Assistant
              </Typography>
              <Typography variant="body" style={styles.emptyStateText}>
                Chat with our AI assistant about skincare, products, routines,
                and get personalized advice.
              </Typography>
              <Button
                label="Start Chat"
                variant="primary"
                size="lg"
                onPress={openChat}
                style={{ marginTop: 24 }}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyStateTitle}>
                Consultation
              </Typography>
              <Typography variant="body" style={styles.emptyStateText}>
                Choose your consultation type to get started.
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  headerSubtitle: {
    opacity: 0.8,
    marginTop: 4,
  },
  consultationTypes: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  consultationOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.neutral.lightest,
  },
  selectedConsultation: {
    borderBottomColor: Colors.primary.default,
  },
  consultationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedConsultationIcon: {
    backgroundColor: Colors.primary.light,
  },
  consultationLabel: {
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dermatologistContainer: {
    marginBottom: 16,
  },
  dermatologistCard: {
    padding: 16,
  },
  dermatologistHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  dermatologistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.neutral.medium,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  dermatologistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dermatologistName: {
    marginBottom: 4,
  },
  dermatologistSpecialty: {
    color: Colors.primary.default,
    marginBottom: 8,
    fontWeight: '500',
  },
  dermatologistStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    marginLeft: 4,
  },
  experienceText: {
    color: Colors.text.tertiary,
  },
  dermatologistBio: {
    marginBottom: 16,
    lineHeight: 20,
  },
  availabilityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  availabilityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  availabilityIcon: {
    marginRight: 4,
  },
  consultButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  closeBtn: {
    padding: 8,
    marginRight: 12,
  },
  chatTitle: {
    color: Colors.neutral.white,
    flex: 1,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageRow: {
    marginBottom: 12,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  aiRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary.default,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.light,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: Colors.background.secondary,
  },
  sendBtn: {
    backgroundColor: Colors.primary.default,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
