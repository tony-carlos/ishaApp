import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import {
  MessageCircle,
  Phone,
  Video,
  Star,
  Calendar,
  Clock,
  Send,
  Bot,
} from 'lucide-react-native';
import { dermatologists, Dermatologist } from '@/assets/data/consultations';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import React from 'react';

// Simple rule-based responses for skincare
const getSkincareResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('acne') || lowerPrompt.includes('pimple')) {
    return "For acne concerns, I recommend a gentle cleanser with salicylic acid or benzoyl peroxide. Keep your skin clean but don't over-wash, as this can stimulate more oil production.";
  }

  if (lowerPrompt.includes('dry') || lowerPrompt.includes('flaky')) {
    return 'For dry skin, use a rich moisturizer with ingredients like hyaluronic acid, glycerin, and ceramides. Apply moisturizer while your skin is still slightly damp after cleansing.';
  }

  if (lowerPrompt.includes('wrinkle') || lowerPrompt.includes('aging')) {
    return 'For anti-aging concerns, consider using products with retinol, vitamin C, and peptides. Always use sunscreen during the day to prevent further damage.';
  }

  if (lowerPrompt.includes('sensitive')) {
    return 'For sensitive skin, look for fragrance-free products with soothing ingredients like aloe vera, chamomile, and green tea. Patch test new products before full application.';
  }

  return "I understand your skincare concern. Could you please provide more specific details about your skin type and the issues you're experiencing? This will help me give you more targeted advice.";
};

type ConsultationType = 'chat' | 'call' | 'video';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ConsultationScreen() {
  const [consultationType, setConsultationType] =
    useState<ConsultationType>('chat');
  const [showDeepSeekChat, setShowDeepSeekChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I am Isher Care AI assistant. How can I help with your skincare routine or beauty questions today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const callDeepSeekAPI = async (prompt: string) => {
    setIsLoading(true);

    try {
      // Use rule-based responses
      const response = getSkincareResponse(prompt);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const userQuery = inputMessage;
    setInputMessage('');

    try {
      // Call the DeepSeek API
      const aiResponseText = await callDeepSeekAPI(userQuery);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      // Add error message from AI
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const DeepSeekChat = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [inputHeight, setInputHeight] = useState(60);
    const animatedInputBottom = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const keyboardWillShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          setKeyboardVisible(true);
          Animated.timing(animatedInputBottom, {
            toValue: e.endCoordinates.height,
            duration: 250,
            useNativeDriver: false,
          }).start();
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      );

      const keyboardWillHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
          Animated.timing(animatedInputBottom, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      );

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }, []);

    // Auto-scroll when messages change
    useEffect(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, [messages]);

    const onContentSizeChange = () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const onInputSizeChange = (event: {
      nativeEvent: { contentSize: { height: number } };
    }) => {
      const height = Math.min(
        100,
        Math.max(60, event.nativeEvent.contentSize.height)
      );
      setInputHeight(height);
    };

    const handleSubmit = () => {
      if (inputMessage.trim().length > 0 && !isLoading) {
        handleSendMessage();
      }
    };

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.deepSeekContainer}>
          <View style={styles.deepSeekHeader}>
            <View style={styles.deepSeekAvatarContainer}>
              <Bot size={24} color={Colors.neutral.white} />
            </View>
            <Typography variant="h4" style={styles.deepSeekTitle}>
              Isher Care
            </Typography>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={onContentSizeChange}
            keyboardShouldPersistTaps="always"
          >
            {messages.map((message, index) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === 'user'
                    ? styles.userMessage
                    : styles.aiMessage,
                  index > 0 && messages[index - 1].sender === message.sender
                    ? styles.consecutiveMessage
                    : {},
                ]}
              >
                {message.sender === 'ai' && index === 0 ? (
                  <View style={styles.aiHeaderBubble}>
                    <Bot
                      size={20}
                      color="#5D3617"
                      style={styles.aiHeaderIcon}
                    />
                    <Typography variant="bodySmall" style={styles.aiHeaderText}>
                      Isher Care
                    </Typography>
                  </View>
                ) : null}

                <Typography
                  variant="body"
                  style={styles.messageText}
                  color={
                    message.sender === 'user'
                      ? Colors.neutral.white
                      : Colors.text.primary
                  }
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  style={styles.messageTime}
                  color={
                    message.sender === 'user'
                      ? Colors.neutral.white
                      : Colors.text.tertiary
                  }
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputOuterContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { height: inputHeight }]}
                placeholder="Ask Isher Care about skin care..."
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                onContentSizeChange={onInputSizeChange}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSubmit}
                keyboardType="default"
                autoCapitalize="sentences"
              />
              {isLoading ? (
                <View style={styles.sendButton}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { opacity: inputMessage.trim() ? 1 : 0.5 },
                  ]}
                  onPress={handleSubmit}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <Send size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

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
            setShowDeepSeekChat(true);
          } else {
            setShowDeepSeekChat(false);
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
          {/* {React.cloneElement(icon as React.ReactElement, { 
            color: textColor 
          })} */}
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
              <Star
                size={16}
                color={Colors.warning.default}
                fill={Colors.warning.default}
              />
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

      {showDeepSeekChat && consultationType === 'chat' ? (
        <DeepSeekChat />
      ) : (
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
              'Skin AI',
              <Bot
                size={24}
                color={
                  consultationType === 'chat'
                    ? '#8B4513'
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
            <Typography variant="h3" style={styles.sectionTitle}>
              Available Specialists
            </Typography>

            {dermatologists.map((dermatologist) => (
              <View
                key={dermatologist.id}
                style={styles.dermatologistContainer}
              >
                {renderDermatologistCard({ item: dermatologist })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  deepSeekContainer: {
    flex: 1,
    backgroundColor: '#FAF3E3',
  },
  deepSeekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#8B4513',
    borderBottomWidth: 1,
    borderBottomColor: '#A47551',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deepSeekAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5D3617',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  deepSeekTitle: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FAF3E3',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 120,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B4513',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#D2B48C',
    borderBottomLeftRadius: 4,
  },
  consecutiveMessage: {
    marginTop: -4,
  },
  messageText: {
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: 10,
    opacity: 0.7,
  },
  aiHeaderBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E6D2B5',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiHeaderIcon: {
    marginRight: 8,
  },
  aiHeaderText: {
    fontWeight: '500',
    color: '#5D3617',
  },
  inputOuterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF3E3',
    borderTopWidth: 1,
    borderTopColor: '#D2B48C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF3E3',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D2B48C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
});
