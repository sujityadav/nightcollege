import axios from "axios";

export const loginAction = async (data) => {
    console.log("Login data submitted:", data);
    try {
      const response = await axios.get(`/api/auth?email=${data.username}&password=${data.password}`);
      return response; 
      
    } catch (error) {
      
    }
  };
  