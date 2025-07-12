import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Heart,
  Share,
  Plus,
  Minus,
  Info,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '@/contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'details' | 'ingredients' | 'reviews'
  >('details');

  useEffect(() => {
    // Parse product data from params
    if (params.product) {
      try {
        const productData = JSON.parse(params.product as string);
        setProduct(productData);
      } catch (error) {
        console.error('Error parsing product data:', error);
        Alert.alert('Error', 'Unable to load product details');
        router.back();
      }
    }
  }, [params.product]);

  const handleAddToCart = () => {
    if (!product) return;

    // Add to cart using the context
    addToCart(product.id, quantity);

    Alert.alert(
      'Added to Cart!',
      `${quantity} x ${product.name} added to your cart`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => router.back(),
        },
        {
          text: 'Go to Shop',
          onPress: () => router.push('/(tabs)/shop'),
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      isFavorite
        ? 'Product removed from your favorites'
        : 'Product added to your favorites'
    );
  };

  const renderTabContent = () => {
    if (!product) return null;

    switch (selectedTab) {
      case 'details':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Product Details
            </Typography>
            <Typography variant="body" style={styles.description}>
              {product.description}
            </Typography>

            {product.skin_types && product.skin_types.length > 0 && (
              <View style={styles.detailSection}>
                <Typography variant="h4" style={styles.detailTitle}>
                  Suitable for Skin Types
                </Typography>
                <View style={styles.tagContainer}>
                  {product.skin_types.map((type, index) => (
                    <View key={index} style={styles.tag}>
                      <Typography
                        variant="caption"
                        color={Colors.primary.default}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {product.concerns && product.concerns.length > 0 && (
              <View style={styles.detailSection}>
                <Typography variant="h4" style={styles.detailTitle}>
                  Addresses Concerns
                </Typography>
                <View style={styles.tagContainer}>
                  {product.concerns.map((concern, index) => (
                    <View key={index} style={styles.tag}>
                      <Typography
                        variant="caption"
                        color={Colors.secondary.default}
                      >
                        {concern.charAt(0).toUpperCase() + concern.slice(1)}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );

      case 'ingredients':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Ingredients
            </Typography>
            {product.ingredients && product.ingredients.length > 0 ? (
              <View style={styles.ingredientsList}>
                {product.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Typography variant="body">• {ingredient}</Typography>
                  </View>
                ))}
              </View>
            ) : (
              <Typography variant="body" color={Colors.text.secondary}>
                Ingredient information not available
              </Typography>
            )}
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Customer Reviews
            </Typography>
            <View style={styles.reviewSummary}>
              <View style={styles.ratingDisplay}>
                <Star
                  size={24}
                  color={Colors.warning.default}
                  fill={Colors.warning.default}
                />
                <Typography variant="h3" style={styles.ratingNumber}>
                  {typeof product.rating === 'string'
                    ? product.rating
                    : product.rating.toFixed(1)}
                </Typography>
              </View>
              <Typography variant="body" color={Colors.text.secondary}>
                Based on {product.review_count} reviews
              </Typography>
            </View>
            <Typography
              variant="body"
              color={Colors.text.secondary}
              style={styles.reviewsPlaceholder}
            >
              Detailed reviews will be available soon
            </Typography>
          </View>
        );

      default:
        return null;
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Typography variant="body">Loading product details...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h4" style={styles.headerTitle}>
          Product Details
        </Typography>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image_url || 'https://via.placeholder.com/400x400',
            }}
            style={styles.productImage}
          />
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
          >
            <Heart
              size={24}
              color={isFavorite ? Colors.error.default : Colors.text.secondary}
              fill={isFavorite ? Colors.error.default : 'none'}
            />
          </TouchableOpacity>
          {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
            <View style={styles.lowStockBadge}>
              <Typography variant="caption" color={Colors.neutral.white}>
                Only {product.stock_quantity} left!
              </Typography>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Typography
            variant="caption"
            color={Colors.text.secondary}
            style={styles.brand}
          >
            {product.brand}
          </Typography>
          <Typography variant="h2" style={styles.productName}>
            {product.name}
          </Typography>

          <View style={styles.ratingContainer}>
            <Star
              size={16}
              color={Colors.warning.default}
              fill={Colors.warning.default}
            />
            <Typography variant="body" style={styles.ratingText}>
              {typeof product.rating === 'string'
                ? product.rating
                : product.rating.toFixed(1)}
            </Typography>
            <Typography variant="caption" color={Colors.text.secondary}>
              ({product.review_count} reviews)
            </Typography>
          </View>

          <Typography
            variant="h3"
            color={Colors.primary.default}
            style={styles.price}
          >
            TZS{' '}
            {typeof product.price === 'string'
              ? product.price
              : product.price.toFixed(2)}
          </Typography>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Typography variant="h4">Quantity</Typography>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} color={Colors.primary.default} />
              </TouchableOpacity>
              <Typography variant="h4" style={styles.quantityText}>
                {quantity}
              </Typography>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity(Math.min(product.stock_quantity, quantity + 1))
                }
              >
                <Plus size={16} color={Colors.primary.default} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stock Status */}
          <View style={styles.stockStatus}>
            <Info
              size={16}
              color={
                product.stock_quantity > 0
                  ? Colors.success.default
                  : Colors.error.default
              }
            />
            <Typography
              variant="body"
              color={
                product.stock_quantity > 0
                  ? Colors.success.default
                  : Colors.error.default
              }
            >
              {product.stock_quantity > 0
                ? `${product.stock_quantity} in stock`
                : 'Out of stock'}
            </Typography>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'details' && styles.activeTab]}
            onPress={() => setSelectedTab('details')}
          >
            <Typography
              variant="body"
              color={
                selectedTab === 'details'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            >
              Details
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'ingredients' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('ingredients')}
          >
            <Typography
              variant="body"
              color={
                selectedTab === 'ingredients'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            >
              Ingredients
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Typography
              variant="body"
              color={
                selectedTab === 'reviews'
                  ? Colors.primary.default
                  : Colors.text.secondary
              }
            >
              Reviews
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          label={product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          variant="primary"
          size="lg"
          icon={<ShoppingBag size={20} color={Colors.neutral.white} />}
          iconPosition="left"
          onPress={handleAddToCart}
          disabled={product.stock_quantity === 0}
          style={styles.addToCartButton}
        />
      </View>
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
    height: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: Colors.neutral.white,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  productImage: {
    width: '100%',
    height: SCREEN_WIDTH - 48,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.warning.default,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productInfo: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  brand: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  ratingText: {
    fontWeight: '600',
  },
  price: {
    marginBottom: 24,
    fontWeight: '700',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.light,
    borderRadius: 24,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary.default,
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  description: {
    lineHeight: 24,
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailTitle: {
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.neutral.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    paddingVertical: 4,
  },
  reviewSummary: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingNumber: {
    fontWeight: '700',
  },
  reviewsPlaceholder: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.light,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartButton: {
    marginBottom: 0,
  },
});
