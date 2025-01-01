import { jwtDecode } from "jwt-decode";

const useUserRole = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null; // Если токена нет, возвращаем null
  }

  try {
    const decoded = jwtDecode(token); // Декодируем токен
    return decoded.role; // Возвращаем роль пользователя
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null; // В случае ошибки возвращаем null
  }
};

export default useUserRole;
