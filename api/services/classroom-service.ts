import api from "../axios-config";

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
      return response.data.data;
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
      const data = response.data.data;
      const users = data.map((item) => item.profile);
      return users;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  getAllUsers: async () => {
    try {
      const response = await api.get(`/e-classroom/user/all`);

      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
    }
  },
  getAllUsersNotEnrolled: async (classId) => {
    try {
      const response = await api.get(
        `/e-classroom/class/${classId}/users-not-enrolled`
      );

      const users = response?.data.data;
      const allUserProfiles = users.map((item) => item.profile);

      return allUserProfiles;
    } catch (error) {
      const message = error.response?.data?.responseType;
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

      return enrollementRequestsProfile;
    } catch (error) {
      const message = error.response?.data?.responseType;
    }
  },
  removeStudent: async (studentId, classId, showToast) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/remove-student/${studentId}`
      );

      showToast("Successfully removed a student!", "success");
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  acceptOrRejectEnrollmentRequest: async (
    studentId,
    classId,
    accept,
    showToast
  ) => {
    try {
      const response = await api.post("/e-classroom/class/process-enrollment", {
        studentId: studentId,
        classId: classId,
        accept: accept,
      });

      if (accept) {
        showToast("Successfully accepted student!", "success");
      } else {
        showToast("Successfully rejected a student!", "success");
      }
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  addStudent: async (studentId, classId, showToast) => {
    try {
      const response = await api.post(
        `/e-classroom/class/${classId}/add-student/${studentId}`
      );

      showToast("Successfully added a student!", "success");
      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
  joinClass: async (classId, studentId, showToast) => {
    try {
      console.log("Class: " + classId + " Student: " + studentId);
      const response = await api.post(
        `/e-classroom/class/${classId}/request-enrollment/${studentId}`
      );

      showToast("Successfully requested to join the class!", "success");
      return response;
    } catch (error) {
      const message = error.response?.data?.responseType;
      showToast(message, "error");
    }
  },
};

export default ClassRoomService;
