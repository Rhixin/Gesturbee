import React, { useState } from 'react';
import { Platform, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { ViewStyle } from 'react-native';

interface LottieWrapperProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  style?: ViewStyle;
  progress?: number;
  speed?: number;
  webStyle?: any;
  fallbackText?: string;
}

const LottieWrapper: React.FC<LottieWrapperProps> = ({
  source,
  autoPlay = true,
  loop = true,
  style,
  progress,
  speed = 1,
  webStyle,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const platformStyle = Platform.OS === 'web' ? { ...style, ...webStyle } : style;

  // Error boundary for Lottie animations
  if (hasError && fallbackText) {
    return (
      <View style={platformStyle} className="justify-center items-center">
        <Text className="text-gray-500 text-sm">{fallbackText}</Text>
      </View>
    );
  }

  try {
    return (
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        style={platformStyle}
        progress={progress}
        speed={speed}
        onAnimationFailure={() => setHasError(true)}
        {...props}
      />
    );
  } catch (error) {
    console.warn('Lottie animation failed to load:', error);
    setHasError(true);
    
    if (fallbackText) {
      return (
        <View style={platformStyle} className="justify-center items-center">
          <Text className="text-gray-500 text-sm">{fallbackText}</Text>
        </View>
      );
    }
    
    return null;
  }
};

export default LottieWrapper;