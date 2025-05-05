import ProgressBar from "@/components/Progressbar";
import SuccessModal from "@/components/SuccessModal";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from 'expo-av';



export default function Level() {
  const { levelId } = useLocalSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [status, setStatus] = React.useState({});
  const videoRef = useRef(null);


  const router = useRouter();
  const goBack = () => router.back();

  const handleSelectAnswer = (option: string) => {
    console.log("Selected:", option);
    setSelectedAnswer(option);
  
    const correctAnswer = levelDummy.lessons[currentLessonIndex].contents.review.answer;
  
    if (option === correctAnswer) {
      setShowSuccessModal(true);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    goToNextContent();
    setSelectedAnswer(null); 
  };
  
  

  const levelDummy = {
    levelId: 2,
    levelname: "A-C",
    lessons: [
      {
        lessonid: 1,
        lessonname: "A",
        lessonnumer: 1,
        contents: {
          video: {
            videoid: 1,
            videourl: "sample.mp4",
            videotitle: "Letter A",
          },
          execute: {
            exeecuteid: 1,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for A",
            answer: "A",
          },
          review: {
            reviewid: 1,
            reviewtitle: "What sign is this?",
            answer: "A",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
      {
        lessonid: 2,
        lessonname: "B",
        lessonnumer: 2,
        contents: {
          video: {
            videoid: 2,
            videourl: "sample.mp4",
            videotitle: "Video of B",
          },
          execute: {
            exeecuteid: 2,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for B",
            answer: "B",
          },
          review: {
            reviewid: 2,
            reviewtitle: "What sign is this?",
            answer: "B",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
      {
        lessonid: 3,
        lessonname: "C",
        lessonnumer: 3,
        contents: {
          video: {
            videoid: 3,
            videourl: "sample.mp4",
            videotitle: "Video of C",
          },
          execute: {
            exeecuteid: 3,
            executevideo: "video.mp4",
            executetitle: "Execute the Sign Language for C",
            answer: "C",
          },
          review: {
            reviewid: 3,
            reviewtitle: "What sign is this?",
            answer: "C",
            choices: ["A", "B", "C", "D"],
          },
        },
      },
    ],
  };

  const totalLessons = levelDummy.lessons.length;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentContentIndex, setCurrentIndex] = useState(0);
  const progressPercent =
    ((currentLessonIndex * 3 + currentContentIndex + 1) / (totalLessons * 3)) *
    100;

  const goToNextContent = () => {
    if (currentContentIndex == 2 && currentLessonIndex < totalLessons) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }

    setCurrentIndex((currentContentIndex + 1) % 3);
  };

  return (
    <View className="bg-white h-[100vh] items-center">
      <SafeAreaView className="bg-secondary rounded-b-3xl w-full">
        <TouchableOpacity className="px-8" onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={"white"} />
        </TouchableOpacity>

        <View className="rounded-2xl w-full px-4 items-center">
          <View className="bg-white px-6 rounded-2xl">
            <Text className="font-poppins-medium text-black text-xl">
              Lesson {currentLessonIndex + 1}
            </Text>
          </View>
          <View className="my-4">
            <Text className="text-white text-2xl font-poppins-medium">
              {levelDummy.lessons[currentLessonIndex].lessonname}
            </Text>
          </View>
        </View>

        <View className="w-full flex items-center mb-4">
          <View className="items-center flex justify-center w-[70%]">
            <ProgressBar
              percent={progressPercent}
              backgroundColor="bg-white"
              fillColor="bg-darkhoney"
            />
          </View>
        </View>
      </SafeAreaView>


      {/* 
      DYNAMIC CONTENT OF THE LESSON
      1.VID
      2.EXECUTE
      3.REVIEW
      */}

      {currentContentIndex === 0 && (
        <> 
      <View className="mx-4 my-6">
      <View className="w-[100%] bg-gray-300 rounded-lg overflow-hidden aspect-video items-center justify-center">
      <Video
          ref={videoRef} 
          source={require('@/assets/videos/a.mp4')}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
          onEnd={async () => {
            if (videoRef.current) {
              await videoRef.current.setStatusAsync
              ({
                shouldPlay: true,
                positionMillis: 0,
              });
            }
          }}
          style={{ width: '100%', height: '100%', aspectRatio: 16 / 9 }}
        />
      </View>
    </View>

     <View className="mb-6 w-[50%]" >
      <View className="bg-teal-500 p-4 rounded-lg">
        <View className="flex-row items-center">
          <TouchableOpacity> 
          <Ionicons name="bookmark-outline" size={24} color="white" className="mr-5" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-poppins-medium ml-2">{levelDummy.lessons[currentLessonIndex].contents.video.videotitle}
          </Text>
        </View>
      </View>
    </View>

    
    </>
      )}

      {currentContentIndex === 1 && (
        <Text>
          {levelDummy.lessons[currentLessonIndex].contents.execute.executetitle}
        </Text>
      )}

      {currentContentIndex === 2 && (
         <> 
         <View className="mx-4 my-4">
         <View className="w-[100%] bg-gray-300 rounded-lg overflow-hidden aspect-video items-center justify-center">
         <Video
          ref={videoRef} 
          source={require('@/assets/videos/a.mp4')}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
          onEnd={async () => {
            if (videoRef.current) {
              await videoRef.current.setStatusAsync
              ({
                shouldPlay: true,
                positionMillis: 0,
              });
            }
          }}
          style={{ width: '100%', height: '100%', aspectRatio: 16 / 9 }}
        />
         </View>
       </View>
   
       <View className="mb-4">
        <Text className="text-2xl text-gray-800 font-semibold text-center">
          {levelDummy.lessons[currentLessonIndex].contents.review.reviewtitle}
        </Text>
      </View>

      <View className="space-y-4">
      {levelDummy.lessons[currentLessonIndex].contents.review.choices.map((option, index) => (
          <TouchableOpacity
            key={index}
            className={`border rounded-full w-[250px] py-2 mb-3 px-6 items-center flex-row justify-between ${
              selectedAnswer === option
                ? option === levelDummy.lessons[currentLessonIndex].contents.review.answer
                  ? "bg-teal-500 border-teal-500"
                  : "bg-white border-teal-500"
                : "bg-white border-gray-300"
            }`}
            onPress={() => handleSelectAnswer(option)}
          >
            <Text
              className={`text-xl font-medium ${
                selectedAnswer === option && option === levelDummy.lessons[currentLessonIndex].contents.review.answer
                  ? "text-white"
                  : "text-teal-500"
              }`}
            >
              {option}
            </Text>
            
            {selectedAnswer === option && option === levelDummy.lessons[currentLessonIndex].contents.review.answer && (
              <View className="bg-yellow-400 h-6 w-6 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
        <SuccessModal isVisible={showSuccessModal} onContinue={handleContinue} />

        
      </View>
   
       
       </>
      )}


      <View className="w-full items-center mb-8">
        <TouchableOpacity
          className="bg-secondary px-6 py-3 rounded-full"
          onPress={goToNextContent}
          disabled={
            currentLessonIndex === totalLessons - 1 && currentContentIndex === 2
          }
        >
          <Text className="text-white font-poppins-medium text-lg">
            {currentLessonIndex === totalLessons - 1 &&
            currentContentIndex === 2
              ? "Completed"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
