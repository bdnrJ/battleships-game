import axios from "axios";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`
})

// axiosClient.interceptors.response.use(
//     (response) => {
//       return response;
//     },
//     (error) => {
//       if (
//         error.response &&
//         error.response.status === 401 &&
//         !error.response.config.headers["X-Check-Admin"]
//       ) {
//         // Clear user data from local storage
//         localStorage.setItem('currentUser', null);

//         // Redirect user to the login page
//         window.location.href = "/login";
//       }
//       return Promise.reject(error);
//     }
//   );

export default axiosClient
