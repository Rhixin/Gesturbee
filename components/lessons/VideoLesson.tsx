import { useAuth } from "@/context/AuthContext";
import { useLevel } from "@/context/LevelContext";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useEffect } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet, ImageBackground } from "react-native";

export default function VideoLesson({
  title,
  videoRef,
  videoSource,
  setStatus,
  currentLessonIndex,
  isViganTheme = false,
  isSiargaoTheme = false,
  isManilaTheme = false,
  isBoracayTheme = false,
  isPalawanTheme = false,
  isCebuTheme = false,
  isBoholTheme = false,
  contentWord = null,
  backgroundImage = null,
  colorTextImage = null,
  colorImage = null,
  isColorStage = false,
}: {
  title: string;
  videoRef: React.RefObject<any>;
  videoSource: any;
  setStatus: (status: any) => void;
  currentLessonIndex: number;
  isViganTheme?: boolean;
  isSiargaoTheme?: boolean;
  isManilaTheme?: boolean;
  isBoracayTheme?: boolean;
  isPalawanTheme?: boolean;
  isCebuTheme?: boolean;
  isBoholTheme?: boolean;
  contentWord?: string | null;
  backgroundImage?: any;
  colorTextImage?: any;
  colorImage?: any;
  isColorStage?: boolean;
}) {
  const {
    userSavedStage,
    userSavedLevel,
    userSavedLesson,
    userSavedTotalLesson,
    updateLevel,
    setShowLevelCompleteModal,
  } = useLevel();
  const { stageId, levelId } = useLocalSearchParams();
  const { currentUser } = useAuth();

  // Handle mo next cya bisag humana ani nga level
  const isThisLessonAlreadyDone = () => {
    if (
      Number(stageId) == userSavedStage &&
      Number(levelId) == userSavedLevel &&
      currentLessonIndex == userSavedLesson
    ) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!isThisLessonAlreadyDone()) {
      // Update Database
      if (userSavedLesson === userSavedTotalLesson) {
        updateLevel(
          currentUser.id,
          userSavedStage,
          userSavedLevel + 1,
          1,
          12,
          true
        );
        setShowLevelCompleteModal(true);
      } else {
        updateLevel(
          currentUser.id,
          userSavedStage,
          userSavedLevel,
          userSavedLesson + 1,
          userSavedTotalLesson,
          false
        );
      }
    } else {
      // Show modal u did it
    }
  }, []);

  // Stage 4 Color layout - no title, video → color text → color image
  const colorStageContent = (
    <>
      {/* Video at top */}
      <View
        className="w-full rounded-lg overflow-hidden items-center"
        style={{ backgroundColor: "transparent", marginTop: 16, marginBottom: 0 }}
      >
        <Video
          ref={videoRef}
          source={videoSource}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={true}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
          onEnd={async () => {
            if (videoRef?.current) {
              await videoRef.current.setStatusAsync({
                shouldPlay: true,
                positionMillis: 0,
              });
            }
          }}
          style={{
            width: "58%",
            height: undefined,
            aspectRatio: 14 / 9,
            backgroundColor: "transparent",
          }}
        />
      </View>

      {/* Color text image (e.g., black_text.png) - smaller */}
      {colorTextImage && (
        <Image
          source={colorTextImage}
          style={styles.colorTextImage}
          resizeMode="contain"
        />
      )}

      {/* Color image (e.g., black.png) - more visible */}
      {colorImage && (
        <Image
          source={colorImage}
          style={styles.colorImage}
          resizeMode="contain"
        />
      )}
    </>
  );

  // Regular stages layout - with title
  const regularContent = (
    <>
      <View style={styles.titleContainer}>
        {/* Bee Image on the Left */}
        <Image
          source={require("@/assets/images/Bee/bee2.png")}
          style={styles.beeImage}
          resizeMode="contain"
        />

        {/* Message Box with Title Text */}
        <View style={styles.messageBoxContainer}>
          <Image
            source={require("@/assets/images/Message/messagebox1.png")}
            style={styles.messageBoxImage}
            resizeMode="contain"
          />
          <View style={styles.messageTextContainer}>
            <Text
              style={[
                styles.messageText,
                { color: isViganTheme ? "#875C35" : isSiargaoTheme ? "#9D7C00" : isManilaTheme ? "#87A248" : isBoracayTheme ? "#488DA2" : isPalawanTheme ? "#6A645C" : isCebuTheme ? "#B65828" : isBoholTheme ? "#6D825A" : "#01D3C1" }
              ]}
            >
              This is "{contentWord || title}"
            </Text>
          </View>
        </View>
      </View>

      <View
        className="w-full rounded-lg overflow-hidden aspect-video items-center mt-4"
        style={{ backgroundColor: "transparent" }}
      >
        <Video
          ref={videoRef}
          source={videoSource}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={true}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
          onEnd={async () => {
            if (videoRef?.current) {
              await videoRef.current.setStatusAsync({
                shouldPlay: true,
                positionMillis: 0,
              });
            }
          }}
          style={{
            width: "50%",
            height: "50%",
            aspectRatio: 14 / 9,
            backgroundColor: "transparent",
          }}
        />
      </View>
    </>
  );

  const content = isColorStage ? colorStageContent : regularContent;

  return backgroundImage ? (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {content}
    </ImageBackground>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  colorTextImage: {
    width: 180,
    height: 50,
    marginTop: 20,
    marginBottom: 8,
  },
  colorImage: {
    width: 160,
    height: 160,
    marginTop: 0,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    width: '80%',
  },
  beeImage: {
    width: 120,
    height: 120,
    marginRight: -20,
    zIndex: 2,
  },
  messageBoxContainer: {
    flex: 1,
    position: 'relative',
    height: 120,
  },
  messageBoxImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  messageTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingLeft: 40,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
