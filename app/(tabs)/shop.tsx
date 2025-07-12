import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Colors from '@/constants/Colors';
import {
  Search,
  FilterX,
  Star,
  ShoppingBag,
  Heart,
  RefreshCw,
  X,
  Plus,
  Minus,
  Filter,
} from 'lucide-react-native';
import apiService from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';

// Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  category: string;
  brand: string;
  ingredients?: string[];
  image_url?: string;
  skin_types?: string[];
  concerns?: string[];
  is_active: boolean;
  stock_quantity: number;
  rating: string | number;
  review_count: number;
}

export default function ShopScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: userLoading } = useUser();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getProductQuantityInCart,
    clearCart,
    getTotalCartItems,
    getTotalCartValue,
  } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);

  // Load products and categories
  useEffect(() => {
    if (!userLoading) {
      loadProducts();
      loadCategories();
    }
  }, [userLoading]);

  // Load products when category changes
  useEffect(() => {
    if (!userLoading) {
      loadProducts();
    }
  }, [selectedCategory, userLoading]);

  const loadProducts = async () => {
    if (userLoading) return;

    try {
      setIsLoading(true);
      const params: any = {};

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getProducts(params);

      if (response.success && (response as any).products) {
        setProducts((response as any).products);
      } else {
        Alert.alert('Error', 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    if (userLoading) return;

    try {
      const response = await apiService.getProductCategories();

      if (response.success && response.data) {
        setCategories(['all', ...response.data]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    await loadCategories();
    setIsRefreshing(false);
  };

  const handleSearch = () => {
    loadProducts();
  };

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery) {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Price filter
    const productPrice =
      typeof product.price === 'string'
        ? parseFloat(product.price)
        : product.price;
    if (productPrice < priceRange.min || productPrice > priceRange.max) {
      return false;
    }

    // Rating filter
    const productRating =
      typeof product.rating === 'string'
        ? parseFloat(product.rating)
        : product.rating;
    if (selectedRating > 0 && productRating < selectedRating) {
      return false;
    }

    // Skin type filter
    if (selectedSkinTypes.length > 0) {
      const hasMatchingSkinType = selectedSkinTypes.some((skinType) =>
        product.skin_types?.includes(skinType)
      );
      if (!hasMatchingSkinType) return false;
    }

    return true;
  });

  // Cart functions are now handled by the CartContext

  const applyFilters = () => {
    // This will trigger the useEffect to reload products
    loadProducts();
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 100 });
    setSelectedRating(0);
    setSelectedSkinTypes([]);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const navigateToProduct = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { product: JSON.stringify(product) },
    });
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Typography
        variant="bodySmall"
        color={
          selectedCategory === item
            ? Colors.primary.default
            : Colors.text.secondary
        }
      >
        {item === 'all'
          ? 'All Products'
          : item.charAt(0).toUpperCase() + item.slice(1)}
      </Typography>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const quantityInCart = getProductQuantityInCart(item.id);

    return (
      <TouchableOpacity onPress={() => navigateToProduct(item)}>
        <Card style={styles.productCard} elevation={2}>
          <View style={styles.productImageContainer}>
            <Image
              source={{
                uri:
                  item.image_url ||
                  'https://via.placeholder.com/200x200?text=No+Image',
              }}
              style={styles.productImage}
            />
            <TouchableOpacity style={styles.favoriteButton}>
              <Heart size={16} color={Colors.primary.default} />
            </TouchableOpacity>
            {quantityInCart > 0 && (
              <View style={styles.cartQuantityBadge}>
                <Typography variant="caption" color={Colors.neutral.white}>
                  {quantityInCart}
                </Typography>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <Typography variant="caption" style={styles.brand}>
              {item.brand}
            </Typography>

            <Typography
              variant="bodySmall"
              style={styles.productName}
              numberOfLines={2}
            >
              {item.name}
            </Typography>

            <View style={styles.productRating}>
              <Star
                size={14}
                color={Colors.warning.default}
                fill={Colors.warning.default}
              />
              <Typography variant="caption" style={styles.ratingText}>
                {typeof item.rating === 'string'
                  ? item.rating
                  : item.rating.toFixed(1)}{' '}
                ({item.review_count})
              </Typography>
            </View>

            <View style={styles.priceAndCart}>
              <Typography
                variant="body"
                color={Colors.primary.default}
                style={styles.price}
              >
                TZS{' '}
                {typeof item.price === 'string'
                  ? item.price
                  : item.price.toFixed(2)}
              </Typography>

              {quantityInCart > 0 ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <Typography variant="body" color={Colors.primary.default}>
                      -
                    </Typography>
                  </TouchableOpacity>

                  <Typography variant="body" style={styles.quantityText}>
                    {quantityInCart}
                  </Typography>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => addToCart(item.id)}
                    disabled={item.stock_quantity === 0}
                  >
                    <Typography variant="body" color={Colors.primary.default}>
                      +
                    </Typography>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    item.stock_quantity === 0 && styles.outOfStockButton,
                  ]}
                  onPress={() => addToCart(item.id)}
                  disabled={item.stock_quantity === 0}
                >
                  <ShoppingBag size={16} color={Colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>

            {item.stock_quantity === 0 && (
              <Typography
                variant="caption"
                color={Colors.error.default}
                style={styles.outOfStock}
              >
                Out of Stock
              </Typography>
            )}

            {item.stock_quantity <= 10 && item.stock_quantity > 0 && (
              <Typography
                variant="caption"
                color={Colors.warning.default}
                style={styles.lowStock}
              >
                Only {item.stock_quantity} left!
              </Typography>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="body">Loading products...</Typography>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <Typography variant="h2">Shop Products</Typography>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={20} color={Colors.text.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <Filter size={20} color={Colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.cartIndicator}>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => setShowCartModal(true)}
                >
                  <ShoppingBag size={24} color={Colors.text.primary} />
                  {cart.length > 0 && (
                    <View style={styles.cartBadge}>
                      <Typography
                        variant="caption"
                        color={Colors.neutral.white}
                      >
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                      </Typography>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.content}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Typography variant="body" color={Colors.text.secondary}>
                No products found
              </Typography>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productWrapper}>
                  {renderProductItem({ item: product })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCartModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h3">Shopping Cart</Typography>
            <TouchableOpacity onPress={() => setShowCartModal(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <ShoppingBag size={64} color={Colors.neutral.medium} />
              <Typography variant="h4" color={Colors.text.secondary}>
                Your cart is empty
              </Typography>
              <Typography variant="body" color={Colors.text.secondary}>
                Add some products to get started
              </Typography>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const product = products.find((p) => p.id === item.id);
                  if (!product) return null;

                  return (
                    <Card style={styles.cartItem}>
                      <View style={styles.cartItemContent}>
                        <Image
                          source={{
                            uri:
                              product.image_url ||
                              'https://via.placeholder.com/80x80',
                          }}
                          style={styles.cartItemImage}
                        />
                        <View style={styles.cartItemInfo}>
                          <Typography variant="bodySmall" numberOfLines={2}>
                            {product.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={Colors.text.secondary}
                          >
                            {product.brand}
                          </Typography>
                          <Typography
                            variant="body"
                            color={Colors.primary.default}
                          >
                            TZS{' '}
                            {typeof product.price === 'string'
                              ? product.price
                              : product.price.toFixed(2)}
                          </Typography>
                        </View>
                        <View style={styles.cartItemQuantity}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              updateCartQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus size={16} color={Colors.primary.default} />
                          </TouchableOpacity>
                          <Typography
                            variant="body"
                            style={styles.quantityText}
                          >
                            {item.quantity}
                          </Typography>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              updateCartQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus size={16} color={Colors.primary.default} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  );
                }}
              />

              <View style={styles.cartFooter}>
                <View style={styles.cartModalTotal}>
                  <Typography variant="h4">
                    Total: TZS {getTotalCartValue(products)}
                  </Typography>
                  <Typography variant="caption" color={Colors.text.secondary}>
                    {getTotalCartItems()} items
                  </Typography>
                </View>
                <View style={styles.cartActions}>
                  <Button
                    label="Clear Cart"
                    variant="secondary"
                    onPress={clearCart}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Checkout"
                    variant="primary"
                    onPress={() =>
                      Alert.alert(
                        'Checkout',
                        'Checkout functionality coming soon!'
                      )
                    }
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography variant="h3">Filter Products</Typography>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Typography variant="h4" style={styles.filterTitle}>
                Price Range
              </Typography>
              <View style={styles.priceRangeContainer}>
                <Input
                  label="Min Price"
                  value={priceRange.min.toString()}
                  onChangeText={(text) =>
                    setPriceRange({ ...priceRange, min: parseFloat(text) || 0 })
                  }
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
                <Input
                  label="Max Price"
                  value={priceRange.max.toString()}
                  onChangeText={(text) =>
                    setPriceRange({
                      ...priceRange,
                      max: parseFloat(text) || 100,
                    })
                  }
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Typography variant="h4" style={styles.filterTitle}>
                Minimum Rating
              </Typography>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      selectedRating === rating && styles.selectedRating,
                    ]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Star
                      size={16}
                      color={
                        selectedRating >= rating
                          ? Colors.warning.default
                          : Colors.neutral.medium
                      }
                      fill={
                        selectedRating >= rating
                          ? Colors.warning.default
                          : 'none'
                      }
                    />
                    <Typography variant="caption">{rating}+</Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Typography variant="h4" style={styles.filterTitle}>
                Skin Types
              </Typography>
              <View style={styles.skinTypesContainer}>
                {['normal', 'dry', 'oily', 'combination', 'sensitive'].map(
                  (skinType) => (
                    <TouchableOpacity
                      key={skinType}
                      style={[
                        styles.skinTypeButton,
                        selectedSkinTypes.includes(skinType) &&
                          styles.selectedSkinType,
                      ]}
                      onPress={() => {
                        if (selectedSkinTypes.includes(skinType)) {
                          setSelectedSkinTypes(
                            selectedSkinTypes.filter((t) => t !== skinType)
                          );
                        } else {
                          setSelectedSkinTypes([
                            ...selectedSkinTypes,
                            skinType,
                          ]);
                        }
                      }}
                    >
                      <Typography
                        variant="caption"
                        color={
                          selectedSkinTypes.includes(skinType)
                            ? Colors.primary.default
                            : Colors.text.secondary
                        }
                      >
                        {skinType.charAt(0).toUpperCase() + skinType.slice(1)}
                      </Typography>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <Button
              label="Reset Filters"
              variant="secondary"
              onPress={resetFilters}
              style={{ flex: 1 }}
            />
            <Button
              label="Apply Filters"
              variant="primary"
              onPress={applyFilters}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeader: {
    backgroundColor: Colors.background.primary,
    paddingTop: 16,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartTotal: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
    height: 44,
  },
  categoriesList: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.light,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: Colors.primary.light,
  },
  content: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productWrapper: {
    width: '48%',
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: Colors.neutral.light,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartQuantityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary.default,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  productInfo: {
    padding: 12,
  },
  brand: {
    color: Colors.text.tertiary,
    marginBottom: 2,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 6,
    minHeight: 32,
    lineHeight: 16,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 3,
  },
  ratingText: {
    color: Colors.text.secondary,
    fontSize: 11,
  },
  priceAndCart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontWeight: '700',
    fontSize: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.light,
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  quantityText: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  addToCartButton: {
    backgroundColor: Colors.primary.default,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockButton: {
    backgroundColor: Colors.neutral.medium,
  },
  outOfStock: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
  },
  lowStock: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.light,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cartItem: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.light,
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  cartFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.light,
  },
  cartModalTotal: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutral.light,
    borderRadius: 12,
  },
  cartActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  // Filter modal styles
  filterContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.light,
  },
  selectedRating: {
    backgroundColor: Colors.primary.light,
  },
  skinTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skinTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.light,
  },
  selectedSkinType: {
    backgroundColor: Colors.primary.light,
  },
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.light,
  },
});
