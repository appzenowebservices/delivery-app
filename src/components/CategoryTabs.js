import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For location and navigate icons
import { getCategory } from '../api/category';
//=========================================================

const CategoryTabs = () => {
  //=========================================================
  const { width } = Dimensions.get('window');
  const [category, setCategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState('fruits');

  useEffect(() => {
    getCategory('')
      .then(response => {

        setCategory(response?.data?.categories)

      })
      .catch(error => console.error(error));
  }, []);

  if (!category) return <Text>Loading...</Text>;


  const renderCategoryTab = (category) => {
    const isActive = activeCategory === category.categoryId;
    // let imageUrl = category?.image;
    // if (imageUrl && imageUrl?.includes('localhost')) {
    //   imageUrl = imageUrl.replace('localhost', '192.168.29.194');
    // }

    return (
      <TouchableOpacity
        key={category.categoryId}
        onPress={() => setActiveCategory(category.categoryId)}
        style={[
          styles.categoryTab,
          {
            backgroundColor: isActive ? category.bgColor : '#fdfbf7',
            borderColor: isActive ? category.color : '#e9d8bf',
          },
        ]}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri:  category?.image }}
          // source={ require('../assets/coke.png')}
          style={{ width: 48, height: 48, borderRadius: 6 }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.categoryLabel,
            {
              color: isActive ? category.color : '#7d6b5d',
            },
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };



  const activeTab = category.find((cat) => cat.categoryId === activeCategory);

  return (
    <View style={styles.container}>
      {/* Header */}


      {/* Scrollable Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {category?.map(renderCategoryTab)}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: '100%', // ADD this line to make container fit its content and parent
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5ebe0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ae2012',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  categoryTab: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  activeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fdfbf7',
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTextContainer: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ae2012',
  },
  activeSubtitle: {
    fontSize: 14,
    color: '#7d6b5d',
    marginTop: 2,
  },
});

export default CategoryTabs;