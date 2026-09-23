import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For location and navigate icons
import ProductCard from '../components/ui/card/ProductCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getInventoryById } from '../api/inventory';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const navigation = useNavigation();

  const route = useRoute();
  const { id } = route.params || {}; // 'id' is the param you passed
  // console.log('Product ID:', id);


  const [productDetail, setProductDetail] = useState([]);

  useEffect(() => {
    getInventoryById(id)
      .then(response => {

        setProductDetail(response?.data?.inventories[0])
        console.log('produc--------------tDetail', productDetail);

      })
      .catch(error => console.error(error));
  }, []);

  if (!productDetail) return <Text>Loading...</Text>;








  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const scrollViewRef = useRef(null);

  // Sample product data
  const product = {
    id: 1,
    name: 'Amul Fresh Milk',
    brand: 'Amul',
    rating: 4.3,
    reviews: 1247,
    originalPrice: 28,
    discountedPrice: 25,
    discount: 11,
    deliveryTime: '8-12 mins',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop',
    ],
    variants: [
      { id: 1, size: '500ml', price: 25, originalPrice: 28 },
      { id: 2, size: '1L', price: 48, originalPrice: 55 },
      { id: 3, size: '2L', price: 92, originalPrice: 105 },
    ],
    description: 'Fresh and pure milk from Amul. Rich in calcium and protein, perfect for your daily nutritional needs.',
    details: [
      'Brand: Amul',
      'Type: Full Cream Milk',
      'Fat Content: 6%',
      'Protein: 3.5g per 100ml',
      'Storage: Keep refrigerated',
      'Shelf Life: 3 days from packaging',
    ],
    nutritionalInfo: [
      { label: 'Energy', value: '67 kcal' },
      { label: 'Protein', value: '3.5g' },
      { label: 'Fat', value: '4.1g' },
      { label: 'Carbohydrates', value: '4.8g' },
      { label: 'Calcium', value: '120mg' },
    ],
  };

  const handleImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveImageIndex(roundIndex);
  };










  const renderImageCarousel = () => (
    <View style={styles.imageContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleImageScroll}
        style={styles.imageCarousel}
      >
        {productDetail?.image?.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.productImage} />
        ))}
      </ScrollView>

      {/* Image indicators */}
      <View style={styles.imageIndicators}>
        {productDetail?.image?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: activeImageIndex === index ? '#00B761' : '#E5E5E5' },
            ]}
          />
        ))}
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Share button */}
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>{product.brand}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviews})</Text>
        </View>
      </View>

      <Text style={styles.productName}>{productDetail.name}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.discountedPrice}>₹{product.variants[selectedVariant].price}</Text>
        <Text style={styles.originalPrice}>₹{product.variants[selectedVariant].originalPrice}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{productDetail.discount}% OFF</Text>
        </View>
      </View>

      <Text style={styles.description}>{productDetail.description}</Text>

      {/* Details button */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => setShowDetails(true)}
      >
        <Text style={styles.detailsButtonText}>View Details & Nutrition Info</Text>
        <Ionicons name="chevron-forward" size={16} color="#00B761" />
      </TouchableOpacity>
    </View>
  );

  const renderVariants = () => (
    <View style={styles.variantsContainer}>
      <Text style={styles.sectionTitle}>Available Sizes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {product.variants.map((variant, index) => (
          <TouchableOpacity
            key={variant.id}
            style={[
              styles.variantCard,
              { borderColor: selectedVariant === index ? '#00B761' : '#E5E5E5' },
            ]}
            onPress={() => setSelectedVariant(index)}
          >
            <Text style={styles.variantSize}>{variant.size}</Text>
            <Text style={styles.variantPrice}>₹{variant.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBottomSection = () => {
    const variant = product.variants[selectedVariant];
    const showCounter = quantity >= 1;

    return (
      <View style={styles.bottomContainer}>
        {/* Variant Detail Row */}
        <View style={styles.variantDetailRow}>
          <Text style={styles.variantDetailText}>
            {`x${quantity} ${variant.size}  ₹${variant.price * quantity} `}
            <Text style={styles.variantMRP}>
              MRP ₹{variant.originalPrice * quantity}
            </Text>
            {variant.originalPrice > variant.price && (
              <Text style={styles.variantDiscount}>
                {'  '}
                {Math.round(
                  ((variant.originalPrice - variant.price) / variant.originalPrice) * 100
                )}% OFF
              </Text>
            )}
          </Text>
        </View>

        {/* Blinkit style Cart Button */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          {!showCounter ? (
            <TouchableOpacity
              style={styles.blinkitCartButton}
              onPress={() => setQuantity(1)}
              activeOpacity={0.85}
            >
              <Text style={styles.blinkitCartButtonText}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.blinkitCartRow}>
              <View style={styles.blinkitCounter}>
                <TouchableOpacity
                  style={styles.blinkitCounterBtn}
                  onPress={() => setQuantity(Math.max(0, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.blinkitCounterText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.blinkitCounterBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Checkout')}
                style={styles.blinkitCartButton} activeOpacity={0.85}>
                <Text style={styles.blinkitCartButtonText}>
                  {quantity} item{quantity > 1 ? 's' : ''} • ₹{variant.price * quantity}  | Go to Cart
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  const renderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Product Details</Text>
          <TouchableOpacity onPress={() => setShowDetails(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Product Information</Text>
            {product.details.map((detail, index) => (
              <Text key={index} style={styles.detailItem}>• {detail}</Text>
            ))}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Nutritional Information (per 100ml)</Text>
            {product.nutritionalInfo.map((info, index) => (
              <View key={index} style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>{info.label}</Text>
                <Text style={styles.nutritionValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderImageCarousel()}
        {renderProductInfo()}
        {renderVariants()}

        {/* Extra spacing for bottom section */}
        <View style={{ height: 120 }} />

        <View style={styles.container}>
          {/* <FlatList
            data={dummyProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item, idx) => item.id?.toString() + idx}
            numColumns={3}
            columnWrapperStyle={styles.row}
            contentContainerStyle={{ padding: 1 }}
          /> */}
        </View>
      </ScrollView>

      {renderBottomSection()}
      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  imageCarousel: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#00B761',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailsButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#00B761',
    fontWeight: '600',
  },
  variantsContainer: {
    padding: 16,
    borderTopWidth: 8,
    borderTopColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  variantCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  variantSize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 12,
    color: '#666',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 12,
    color: '#00B761',
    fontWeight: '600',
    marginLeft: 4,
  },
  cartSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00B761',
    borderRadius: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#00B761',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#333',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  variantDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  variantDetailText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  variantMRP: {
    fontSize: 13,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  variantDiscount: {
    fontSize: 13,
    color: '#00B761',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  blinkitCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  blinkitCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B761',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 8,
  },
  blinkitCounterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blinkitCounterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    minWidth: 28,
    textAlign: 'center',
  },
  blinkitCartButton: {
    flex: 1,
    backgroundColor: '#00B761',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  blinkitCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;