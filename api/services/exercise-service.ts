import { Platform } from "react-native";
import api from "../axios-config";

const ExerciseService = {
  createExercise: async (quiz) => {
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
    contentTypeOrMap: string | Record<number, string>
  ) => {
    try {
      // Determine if we have a single content type or a map
      const isContentTypeMap = typeof contentTypeOrMap === 'object';
      
      console.log("Starting upload with:", {
        uriListLength: uriList.length,
        signedUrlKeys: Object.keys(signedUrlList),
        contentTypeOrMap,
        isContentTypeMap
      });

      const uploadPromises = Object.entries(signedUrlList).map(
        async ([key, signedUrl]) => {
          const numericKey = Number(key);
          const index = numericKey - 1;
          const file = uriList[index];

          console.log(`Processing file ${index} (key ${numericKey}):`, {
            fileExists: !!file,
            fileType: typeof file,
            signedUrlExists: !!signedUrl
          });

          if (!file) {
            throw new Error(`No file found at index ${index} for key ${numericKey}`);
          }

          if (!signedUrl) {
            throw new Error(`No signed URL found for key ${numericKey}`);
          }

          // Get the content type for this specific file
          const contentType = isContentTypeMap 
            ? (contentTypeOrMap as Record<number, string>)[numericKey] || "application/octet-stream"
            : (contentTypeOrMap as string);

          console.log(`Using content type for file ${index} (key ${numericKey}): ${contentType}`);

          let body: Blob;

          if (Platform.OS === "web") {
            // In web, `file` should already be a File or Blob
            if (!(file instanceof Blob)) {
              throw new Error(`Expected file to be Blob or File on web, got ${typeof file}`);
            }
            body = file;
            console.log(`Web file prepared: size=${body.size}, type=${body.type}`);
          } else {
            // In native, fetch the URI and convert it to Blob
            console.log(`Fetching file from URI: ${file}`);
            try {
              const response = await fetch(file as string);
              if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
              }
              body = await response.blob();
              console.log(`Native file prepared: size=${body.size}, type=${body.type}`);
            } catch (fetchError) {
              console.error(`Error fetching file from URI:`, fetchError);
              throw new Error(`Failed to read file from URI: ${fetchError.message}`);
            }
          }

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": contentType,
            },
            body,
          });

          if (!uploadResponse.ok) {
            let errorDetails = uploadResponse.statusText;
            try {
              const errorText = await uploadResponse.text();
              if (errorText) {
                errorDetails += ` - ${errorText}`;
              }
            } catch (e) {
              // If we can't read the response text, just use statusText
            }
            
            console.error(`Upload failed for file ${index} (key ${numericKey}):`, {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              url: signedUrl,
              contentType,
              fileSize: body?.size || 'unknown'
            });
            
            throw new Error(
              `Upload failed for file ${index} (key ${numericKey}): ${errorDetails}`
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
  getAssignedExercise: async (classId) => {
    try {
      const response = await api.get(`/e-classroom/class/${classId}/exercises`);

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched all Assigned Exercises",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching Assigned Exercises",
        data: null,
      };
    }
  },
  getAllUnassignedExercise: async (classId, teacherId) => {
    try {
      const response = await api.get(
        `/e-classroom/class/${classId}/exercises/unassigned`,
        {
          params: {
            teacherId: teacherId,
          },
        }
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
      console.log("Fetching exercise with ID:", exerciseId);
      const response = await api.get(`/e-classroom/exercise/${exerciseId}`);
      
      console.log("API response:", response);
      console.log("Response data:", response.data);

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched Exercise Details",
      };
    } catch (error) {
      console.error("Error in getSpecificExercise:", error);
      console.error("Error response:", error.response);
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          error.response?.data?.message ||
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

      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
      }

      return {
        success: true,
        data: videoResponse.url,
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
  editExerciseItem: async (editData) => {
    try {
      const response = await api.patch("/e-classroom/exercise/item/edit-item", editData);

      return {
        success: true,
        data: response.data,
        message: "Successfully updated exercise item",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error updating exercise item",
        data: null,
      };
    }
  },
};

export default ExerciseService;
