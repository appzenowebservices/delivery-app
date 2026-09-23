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
        <Star key={`full-${i}`} size={size} color="#facc15" fill="#facc15" />
      ))}
      {hasHalfStar && (
        <Star key="half" size={size} color="#facc15" fill="url(#half)" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} color="#d1d5db" />
      ))}
    </View>
  );
};

export default RatingStars;
