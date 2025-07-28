import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// Icon mapping from lucide-react-native to @expo/vector-icons
export const Icons = {
  // Navigation icons
  ArrowRight: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chevron-forward', size, color }),
  ArrowLeft: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chevron-back', size, color }),
  ChevronRight: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chevron-forward', size, color }),
  ChevronDown: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chevron-down', size, color }),
  ChevronUp: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chevron-up', size, color }),

  // Action icons
  Check: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'checkmark', size, color }),
  Search: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'search', size, color }),
  Plus: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'add', size, color }),
  Minus: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'remove', size, color }),
  Close: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'close', size, color }),

  // User/Auth icons
  User: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'person', size, color }),
  Mail: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'mail', size, color }),
  Lock: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'lock-closed', size, color }),

  // Navigation/Tab icons
  Home: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'home', size, color }),
  Camera: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'camera', size, color }),
  Shop: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'bag', size, color }),
  Profile: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'person-circle', size, color }),
  Game: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'game-controller', size, color }),
  Consultation: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'chatbubbles', size, color }),

  // Product/Shop icons
  Heart: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'heart', size, color }),
  Star: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'star', size, color }),
  Cart: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'cart', size, color }),
  Filter: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'filter', size, color }),

  // Utility icons
  Settings: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'settings', size, color }),
  Info: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'information-circle', size, color }),
  Alert: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'warning', size, color }),
  Success: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'checkmark-circle', size, color }),

  // Media icons
  Image: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'image', size, color }),
  Video: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'videocam', size, color }),
  Play: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'play', size, color }),
  Pause: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'pause', size, color }),

  // Camera/Upload icons
  CloudUpload: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'cloud-upload', size, color }),
  RotateCw: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'refresh', size, color }),
  X: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'close', size, color }),

  // Communication icons
  Phone: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'call', size, color }),
  Message: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'chatbubble', size, color }),
  Share: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'share', size, color }),
  Bookmark: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'bookmark', size, color }),
  MapPin: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'location', size, color }),
  TrendingUp: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'trending-up', size, color }),
  Send: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'send', size, color }),
  Bot: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'chatbubble-ellipses', size, color }),
  Calendar: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'calendar', size, color }),
  Bell: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'notifications', size, color }),
  HelpCircle: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'help-circle', size, color }),
  Shield: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'shield-checkmark', size, color }),
  LogOut: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'log-out', size, color }),
  Trophy: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'trophy', size, color }),
  PauseCircle: ({
    size = 24,
    color = '#000',
  }: {
    size?: number;
    color?: string;
  }) => React.createElement(Ionicons, { name: 'pause-circle', size, color }),
  Clock: ({ size = 24, color = '#000' }: { size?: number; color?: string }) =>
    React.createElement(Ionicons, { name: 'time', size, color }),
};

// Export individual icons for direct import
export const {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Plus,
  Minus,
  Close,
  User,
  Mail,
  Lock,
  Home,
  Camera,
  Shop,
  Profile,
  Game,
  Consultation,
  Heart,
  Star,
  Cart,
  Filter,
  Settings,
  Info,
  Alert,
  Success,
  Image,
  Video,
  Play,
  Pause,
  CloudUpload,
  RotateCw,
  X,
  Phone,
  Message,
  Share,
  Bookmark,
  MapPin,
  TrendingUp,
  Send,
  Bot,
  Calendar,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  Trophy,
  PauseCircle,
  Clock,
} = Icons;
