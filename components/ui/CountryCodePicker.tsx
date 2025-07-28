import { useState } from 'react';
import { StyleSheet, View, Modal, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Typography from './Typography';
import Colors from '@/constants/Colors';
import { Search, ChevronDown } from '@/utils/icons';
import { CountryCode, countryCodes } from '@/utils/countryData';

interface CountryCodePickerProps {
  selectedCountry: CountryCode;
  onSelect: (country: CountryCode) => void;
}

export default function CountryCodePicker({ selectedCountry, onSelect }: CountryCodePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial_code.includes(searchQuery)
  );

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        onSelect(item);
        setModalVisible(false);
      }}
    >
      <Typography variant="body" style={styles.flag}>
        {item.flag}
      </Typography>
      <Typography variant="body" style={styles.countryName}>
        {item.name}
      </Typography>
      <Typography variant="body" color={Colors.text.tertiary}>
        {item.dial_code}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Typography variant="body" style={styles.flag}>
          {selectedCountry.flag}
        </Typography>
        <Typography variant="body" style={styles.dialCode}>
          {selectedCountry.dial_code}
        </Typography>
        <ChevronDown size={20} color={Colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.neutral.medium} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search country"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={item => item.code}
              showsVerticalScrollIndicator={false}
              style={styles.countryList}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Typography variant="body" color={Colors.primary.default}>
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral.light,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  dialCode: {
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 8,
  },
  countryList: {
    maxHeight: '70%',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  countryName: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.light,
  },
});