import React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native'; // Make sure to install this package

const RatingStars = ({ rating = 0, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} color="#e9c46a" fill="#e9c46a" />
      ))}
      {hasHalfStar && (
        <Star key="half" size={size} color="#e9c46a" fill="url(#half)" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} color="#e9d8bf" />
      ))}
    </View>
  );
};

export default RatingStars;
