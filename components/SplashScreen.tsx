import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const beeX = useRef(new Animated.Value(-150)).current;
  const beeY = useRef(new Animated.Value(0)).current;
  const bannerFadeAnim = useRef(new Animated.Value(0)).current;  // Animated value for banner fade-in
  const [typedText, setTypedText] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);  // State for banner visibility

  const fullText = 'GESTURBEE';
  const beeStartIndex = 6; // "BEE" starts at index 6

  useEffect(() => {
    // Animate bee flying in and text appearing
    Animated.parallel([
      Animated.timing(beeX, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(beeY, {
        toValue: -80,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate text typing
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          const nextChar = fullText.charAt(index);
          setTypedText((prev) => prev + nextChar);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            // After typing ends, display the banner text
            setBannerVisible(true);

            // Animate the banner fade-in
            Animated.timing(bannerFadeAnim, {
              toValue: 1,
              duration: 1500,  // Duration of the fade-in
              useNativeDriver: true,
            }).start();

            // After a brief delay, trigger onFinish
            setTimeout(() => {
              onFinish();
            }, 4000);
          }, 500); // Delay before showing the banner
        }
      }, 150);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Bee Image */}
      <Animated.Image
        source={require('@/assets/images/Bee.png')}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [
              { translateX: beeX },
              { translateY: beeY },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* Animated Text */}
      <Text style={styles.text}>
        {typedText.split('').map((char, idx) => (
          <Text
            key={idx}
            style={idx >= beeStartIndex ? styles.secondaryText : styles.primaryText}
          >
            {char}
          </Text>
        ))}
      </Text>

      {/* Banner Text with fade-in animation */}
      {bannerVisible && (
        <Animated.Text
          style={[
            styles.bannerText,
            { opacity: bannerFadeAnim }  // Apply fade-in effect
          ]}
        >
          Turning Gestures into Conversations
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00BFAF',  // Primary color
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  text: {
    flexDirection: 'row',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  primaryText: {
    color: '#fff',  // Primary text color
  },
  secondaryText: {
    color: '#facc15',  // Secondary text color
  },
  bannerText: {
    marginTop: 20,  // Add some space between the text and the banner
    fontSize: 18,   // Set the font size for the banner
    color: '#fff',  // Set color to white
    fontStyle: 'italic',  // Optional: makes the text italic
    textAlign: 'center', // Center-align the banner text
  },
});
