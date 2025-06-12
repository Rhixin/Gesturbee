import { Platform } from "react-native";
import api from "../axios-config";

const ClassRoomService = {
  createClassroom: async (teacherId, className, classDescription) => {
    try {
      const response = await api.post("/e-classroom/class/create-class", {
        teacherId: teacherId,
        className: className,
        classDescription: classDescription,
      });

      return {
        success: true,
        data: response.data.data,
        message: "Successfully Created a Classroom",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType || "Error Creating a Classroom",
        data: null,
      };
    }
  },
  getClassroom: async (classId) => {
    try {
      const response = await api.get(`/e-classroom/class/${classId}`);

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched details about the Classroom",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching Classroom Details",
        data: null,
      };
    }
  },
  getAllTeacherClasses: async (teacherId) => {
    try {
      const response = await api.get(
        `/e-classroom/teacher/${teacherId}/classes`
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched all Created Classes",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching teacher classes",
        data: null,
      };
    }
  },
  getAllStudentClasses: async (teacherId) => {
    try {
      const response = await api.get(
        `/e-classroom/student/${teacherId}/classes`
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully fetched all Joined Classes",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching student classes",
        data: null,
      };
    }
  },
  getAllStudentsInThisClass: async (classId, showToast) => {
    try {
      const response = await api.get(`/e-classroom/class/${classId}/students`);
      const data = response.data.data;
      const users = data.map((item) => item.profile);
      return {
        success: true,
        data: users,
        message: "Successfully fetched all Students in the Class",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching students in This Class",
        data: null,
      };
    }
  },
  getAllUsersNotEnrolled: async (classId) => {
    try {
      const response = await api.get(
        `/e-classroom/class/${classId}/users-not-enrolled`
      );

      const users = response?.data.data;
      const allUserProfiles = users.map((item) => item.profile);

      return {
        success: true,
        data: allUserProfiles,
        message: "Successfully fetched all Users Not Enrolled",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching students not enrolled in this class",
        data: null,
      };
    }
  },
  getAllEnrollmentRequests: async (classId) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/enrollments-requests`
      );

      const enrollementRequests = response?.data.data;
      const enrollementRequestsProfile = enrollementRequests.map(
        (item) => item.profile
      );

      return {
        success: true,
        data: enrollementRequestsProfile,
        message: "Successfully fetched all enrollment requests",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching enrollment requests",
        data: null,
      };
    }
  },
  removeStudent: async (studentId, classId) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/remove-student/${studentId}`
      );

      return {
        success: true,
        data: response?.data.data,
        message: "Successfully remmoved a Student",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error removing student",
        data: null,
      };
    }
  },
  acceptOrRejectEnrollmentRequest: async (studentId, classId, accept) => {
    try {
      const response = await api.post("/e-classroom/class/process-enrollment", {
        studentId: studentId,
        classId: classId,
        accept: accept,
      });

      return {
        success: true,
        data: response?.data.data,
        message: `Successfully ${accept ? "Accepted" : "Rejected"} a student`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error processing enrollment request",
        data: null,
      };
    }
  },
  addStudent: async (studentId, classId) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/add-student/${studentId}`
      );

      return {
        success: true,
        data: response?.data.data,
        message: "Successfully added a Student",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error adding student",
        data: null,
      };
    }
  },
  joinClass: async (classId, studentId) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/request-enrollment/${studentId}`
      );

      return {
        success: true,
        data: response?.data.data,
        message: "Successfully Joined a Class",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.responseType || "Error adding student",
        data: null,
      };
    }
  },
  assignExercise: async (classId, exerciseId) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/exercise/${exerciseId}`
      );

      return {
        success: true,
        data: response?.data.data,
        message: "Successfully Assigned An Exercise",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType || "Error assigning an exercise",
        data: null,
      };
    }
  },
  getStudentClassExerciseAnswers: async (studentId, classExerciseId) => {
    try {
      const response = await api.get(
        `/e-classroom/student/${studentId}/class-exercise/${classExerciseId}/answers`
      );

      return {
        success: true,
        data: response?.data.data,
        message: "Successfully fetched all student answers",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.responseType ||
          "Error fetching student answers",
        data: null,
      };
    }
  },
};

export default ClassRoomService;
