// /* eslint-disable no-alert */
// import axios from "axios";

// const isToken = localStorage.getItem("token");

// axios.interceptors.request.use(
//   (config) => {
//     if (isToken) {
//       config.headers.Authorization = `Bearer ${isToken}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       if (isToken) {
//         localStorage.clear();
//       }
//       window.location = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export const handleNetworkError = (error) => {
//   if (error.message === "Network request failed") {
//     alert(
//       "Kesalahan Jaringan",
//       "Silakan periksa koneksi Anda dan coba kembali.",
//       "iconNoInet"
//     );
//   }
//   throw error;
// };

// export const handleCommonError = (error) => {
//   if (error && error.data.msg === "invalid token") {
//     alert(
//       "Session kamu telah habis",
//       "Silakan login kembali dengan akun kamu yg telah terdaftar"
//     );
//     throw new Error({
//       logout: true,
//     });
//   } else {
//     throw error;
//   }
// };
