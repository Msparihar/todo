import api from "./axios";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Helper function to set cookie with expiry
export const setCookie = (
  name: string,
  value: string,
  expiryMinutes: number
) => {
  const date = new Date();
  date.setTime(date.getTime() + expiryMinutes * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

// Helper function to get cookie
export const getCookie = (name: string): string | null => {
  const cookieName = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

// Helper function to delete cookie
export const deleteCookie = (name: string) => {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
};

export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Convert to form data as required by OAuth2 password flow
    const formData = new FormData();

    // Use username for credentials - this could be an email too as FastAPI will handle it
    formData.append("username", data.username);
    formData.append("password", data.password);

    console.log("Attempting login with username:", data.username);

    const response = await api.post<AuthResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Login successful, setting token cookie and auth header");

    // Store the token in cookies with 30 minutes expiry
    setCookie("accessToken", response.data.access_token, 30);

    // Also set it in axios default headers for future requests
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data.access_token}`;

    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};
