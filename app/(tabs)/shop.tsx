import { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Colors from '@/constants/Colors';
import { Search, FilterX, Star, ShoppingBag, Heart } from 'lucide-react-native';
import { skincareProducts, Product } from '@/assets/data/skincareProducts';

// Product Categories
const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'cleanser', name: 'Cleansers' },
  { id: 'toner', name: 'Toners' },
  { id: 'serum', name: 'Serums' },
  { id: 'moisturizer', name: 'Moisturizers' },
  { id: 'sunscreen', name: 'Sunscreens' },
  { id: 'mask', name: 'Masks' },
  { id: 'treatment', name: 'Treatments' },
];

export default function ShopScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([]);
  
  // Filter products based on search query and selected category
  const filteredProducts = skincareProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const addToCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { id: productId, quantity: 1 }];
      }
    });
  };
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Typography
        variant="bodySmall"
        color={selectedCategory === item.id ? Colors.primary.default : Colors.text.secondary}
      >
        {item.name}
      </Typography>
    </TouchableOpacity>
  );
  
  const renderProductItem = ({ item }: { item: Product }) => (
    <Card style={styles.productCard} elevation={1}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={18} color={Colors.primary.default} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Typography variant="bodySmall" style={styles.brand}>
          {item.brand}
        </Typography>
        
        <Typography variant="body" style={styles.productName} numberOfLines={2}>
          {item.name}
        </Typography>
        
        <View style={styles.productRating}>
          <Star size={16} color={Colors.warning.default} fill={Colors.warning.default} />
          <Typography variant="caption" style={styles.ratingText}>
            {item.rating.toFixed(1)}
          </Typography>
        </View>
        
        <View style={styles.priceAndCart}>
          <Typography variant="h4" color={Colors.primary.default}>
            ${item.price.toFixed(2)}
          </Typography>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item.id)}
          >
            <ShoppingBag size={18} color={Colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <Typography variant="h2">
              Shop Products
            </Typography>
            
            <View style={styles.cartIndicator}>
              <TouchableOpacity style={styles.cartButton}>
                <ShoppingBag size={24} color={Colors.text.primary} />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Typography variant="caption" color={Colors.neutral.white}>
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              icon={<Search size={20} color={Colors.neutral.medium} />}
              rightIcon={
                searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <FilterX size={20} color={Colors.neutral.medium} />
                  </TouchableOpacity>
                ) : null
              }
              onRightIconPress={() => setSearchQuery('')}
              style={styles.searchInput}
            />
          </View>
          
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productWrapper}>
                {renderProductItem({ item: product })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  stickyHeader: {
    backgroundColor: Colors.background.primary,
    paddingTop: 60,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartIndicator: {
    position: 'relative',
  },
  cartButton: {
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary.default,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  categoriesList: {
    paddingVertical: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.white,
    marginRight: 12,
  },
  selectedCategory: {
    borderColor: Colors.primary.default,
    backgroundColor: Colors.primary.light,
  },
  content: {
    padding: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  productCard: {
    padding: 0,
    overflow: 'hidden',
    height: 280,
  },
  productImageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.neutral.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  brand: {
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  productName: {
    fontWeight: '500',
    marginBottom: 8,
    height: 48,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
  },
  priceAndCart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: Colors.primary.default,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});