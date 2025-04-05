import { jwtDecode } from "jwt-decode";

const useUserRole = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

export default useUserRole;
