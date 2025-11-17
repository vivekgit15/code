// import axios from "axios";
// import { useAuth } from "@clerk/clerk-react";

// export const useAxiosWithAuth = () => {
//   const { getToken, userId, user } = useAuth();

//   const instance = axios.create({
//     baseURL: "http://localhost:8000/api",
//   });

//   instance.interceptors.request.use(async (config) => {
//     const token = await getToken({ template: "default" });
//     config.headers["Authorization"] = `Bearer ${token}`;
//     config.headers["x-user-id"] = userId || "unknown";
//     config.headers["x-user-email"] = user?.primaryEmailAddress?.emailAddress || "unknown@clerk.app";
//     return config;
//   });

//   return instance;
// };
