import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import {
  User,
  Settings,
  Camera,
  ChevronRight,
  Calendar,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
} from '@/utils/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getInitials } from '@/utils/helpers';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { analyses } = useSkinAnalysis();

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(onboarding)/services');
        },
      },
    ]);
  };

  const handleNewScan = () => {
    router.push('/(onboarding)/scan');
  };

  const renderProfileInfo = () => (
    <View style={styles.profileInfo}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Typography variant="h1" color={Colors.neutral.white}>
            {getInitials(user?.full_name || '')}
          </Typography>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Typography variant="h2">{user?.full_name}</Typography>
        <Typography variant="body" style={styles.userMeta}>
          {user?.location}
        </Typography>
      </View>
    </View>
  );

  const renderProfileStats = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Typography variant="h4" align="center">
          {analyses.length}
        </Typography>
        <Typography variant="caption" align="center">
          Skin Scans
        </Typography>
      </Card>

      <Card style={styles.statCard}>
        <Typography variant="h4" align="center">
          {user?.skin_concerns?.length || 0}
        </Typography>
        <Typography variant="caption" align="center">
          Concerns
        </Typography>
      </Card>

      <Card style={styles.statCard}>
        <Typography variant="h4" align="center">
          {30}
        </Typography>
        <Typography variant="caption" align="center">
          Days Active
        </Typography>
      </Card>
    </View>
  );

  const renderSettingsSection = (
    title: string,
    items: { icon: React.ReactElement; label: string; onPress: () => void }[]
  ) => (
    <View style={styles.settingsSection}>
      <Typography
        variant="bodySmall"
        color={Colors.text.tertiary}
        style={styles.sectionTitle}
      >
        {title}
      </Typography>

      <Card style={styles.settingsCard} elevation={0}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.settingItem,
              index !== items.length - 1 && styles.settingItemBorder,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.settingIcon}>{item.icon}</View>
            <Typography variant="body" style={styles.settingLabel}>
              {item.label}
            </Typography>
            <ChevronRight size={20} color={Colors.neutral.medium} />
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileInfo()}

        {renderProfileStats()}

        <View style={styles.actionsContainer}>
          <Button
            label="Take New Skin Scan"
            variant="primary"
            size="md"
            icon={<Camera size={20} color={Colors.neutral.white} />}
            iconPosition="left"
            style={styles.scanButton}
            onPress={handleNewScan}
          />
        </View>

        {renderSettingsSection('Account Settings', [
          {
            icon: <User size={20} color={Colors.primary.default} />,
            label: 'Edit Profile',
            onPress: () => {},
          },
          {
            icon: <Calendar size={20} color={Colors.primary.default} />,
            label: 'My Appointments',
            onPress: () => {},
          },
          {
            icon: <Bell size={20} color={Colors.primary.default} />,
            label: 'Notifications',
            onPress: () => {},
          },
        ])}

        {renderSettingsSection('More', [
          {
            icon: <HelpCircle size={20} color={Colors.primary.default} />,
            label: 'Help & Support',
            onPress: () => {},
          },
          {
            icon: <Shield size={20} color={Colors.primary.default} />,
            label: 'Privacy & Terms',
            onPress: () => {},
          },
          {
            icon: <LogOut size={20} color={Colors.error.default} />,
            label: 'Log Out',
            onPress: handleLogout,
          },
        ])}

        <View style={styles.versionContainer}>
          <Typography
            variant="caption"
            color={Colors.text.tertiary}
            align="center"
          >
            ISHER CARE v1.0.0
          </Typography>
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
  profileInfo: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userMeta: {
    marginTop: 4,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  scanButton: {
    width: '100%',
  },
  settingsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
    paddingLeft: 4,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingLabel: {
    flex: 1,
  },
  versionContainer: {
    padding: 24,
    paddingBottom: 40,
  },
});
