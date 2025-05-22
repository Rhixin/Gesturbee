import api from "../axios-config";
import { navigate } from "expo-router/build/global-state/routing";

const ClassRoomService = {
  createClassroom: async (
    teacherId,
    className,
    classDescription,
    showToast,
    navigate
  ) => {
    try {
      const response = await api.post("/e-classroom/class/create-class", {
        teacherId: teacherId,
        className: className,
        classDescription: classDescription,
      });

      showToast("Created a Classroom Successfully!", "success");
      navigate("/(auth)/classes");
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  getClassroom: async (classId, showToast) => {
    try {
      const response = await api.get(`/e-classroom/class/${classId}`);

      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  getAllTeacherClasses: async (teacherId, showToast) => {
    try {
      const response = await api.get(
        `/e-classroom/teacher/${teacherId}/classes`
      );

      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  getAllStudentsInThisClass: async (classId, showToast) => {
    try {
      const response = await api.get(`/e-classroom/class/${classId}/students`);

      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  removeStudent: async (studentId, classId, showToast, navigate) => {
    try {
      const response = await api.post("/e-classroom/class/remove-student", {
        studentId: studentId,
        classId: classId,
      });

      showToast("Successfully removed a student!", "success");
      navigate(`/(auth)/classes/classroom/${classId}`);
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
};

export default ClassRoomService;
