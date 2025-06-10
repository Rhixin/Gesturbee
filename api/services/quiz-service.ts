import { Platform } from "react-native";
import api from "../axios-config";

const QuizService = {
  createQuiz: async (quiz) => {
    try {
      const response = await api.post("/e-classroom/exercise", quiz);

      return {
        success: true,
        data: response.data.data,
        message: "Successfully created a Quiz",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error creating a quiz",
        data: null,
      };
    }
  },
  uploadPresignedUrl: async (presignedUrlList) => {
    try {
      const response = await api.post(
        "/e-classroom/upload-presigned-url",
        presignedUrlList
      );

      return {
        success: true,
        data: response.data.urlMap,
        message: "Successfully Uploaded Presigend Urls",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error uploading video",
        data: null,
      };
    }
  },
  uploadSignedUrl: async (
    uriList: string[] | File[] | Blob[],
    signedUrlList: Record<number, string>,
    contentType: string
  ) => {
    try {
      const uploadPromises = Object.entries(signedUrlList).map(
        async ([key, signedUrl]) => {
          const numericKey = Number(key);
          const index = numericKey - 1;
          const file = uriList[index];

          let body: Blob;

          if (Platform.OS === "web") {
            // In web, `file` should already be a File or Blob
            if (!(file instanceof Blob)) {
              throw new Error("Expected file to be Blob or File on web");
            }
            body = file;
          } else {
            // In native, fetch the URI and convert it to Blob
            const response = await fetch(file as string);
            body = await response.blob();
          }

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": contentType,
            },
            body,
          });

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload failed for file ${index} (key ${numericKey}): ${uploadResponse.statusText}`
            );
          }

          return true;
        }
      );

      const results = await Promise.all(uploadPromises);
      const allSuccess = results.every((result) => result === true);

      if (allSuccess) {
        return {
          success: true,
          data: null,
          message: "Successfully uploaded all files",
        };
      } else {
        throw new Error("Some file uploads failed");
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.responseType ||
          error.message ||
          "Failed to upload all videos",
      };
    }
  },
  createVideoContent: async (videoList) => {
    try {
      const response = await api.post(
        "/e-classroom/exercise-content",
        videoList
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully Uploaded Video Content",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error uploading Video Content to DB",
        data: null,
      };
    }
  },
  getAllExercise: async (teacherId) => {
    try {
      const response = await api.get(
        `/e-classroom/teacher/${teacherId}/exercises`
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched all Teacher Exercises",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching Teacher Exercises",
        data: null,
      };
    }
  },
  getSpecificExercise: async (exerciseId) => {
    try {
      const response = await api.get(`/e-classroom/exercise/${exerciseId}`);

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched Exercise Details",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching exercise details",
        data: null,
      };
    }
  },
  getVideoContent: async (presignedUrl: string) => {
    try {
      const videoResponse = await fetch(presignedUrl, {
        method: "GET",
        headers: {
          Accept: "video/*",
        },
      });

      console.log(videoResponse);

      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
      }

      const videoBlob = await videoResponse.blob();
      const blobUrl = URL.createObjectURL(videoBlob);

      return {
        success: true,
        data: {
          blobUrl,
          blob: videoBlob,
        },
        message: "Successfully fetched video content",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.responseType ||
          error.message ||
          "Failed to fetch video content",
      };
    }
  },
};

export default QuizService;
