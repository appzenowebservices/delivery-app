import axios from 'axios';
import { baseURL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// ===================================================================
// 🔑 Attach token from AsyncStorage dynamically
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("authToken"); // token stored after login
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        } catch (err) {
            console.log("Error getting token", err);
        }
        return config;
    },
    (error) => Promise.reject(error)
);


export default apiClient;