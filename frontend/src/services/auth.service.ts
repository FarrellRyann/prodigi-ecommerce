import { api } from '@/lib/axios';
import { 
  AuthResponse, 
  LoginPayload, 
  RegisterPayload, 
  User 
} from '@/types/auth';

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    // Current backend might not have a /logout if it just relies on cookie expiration
    // but we can add it or just clear client state.
    await api.post('/auth/logout').catch(() => {}); 
  }
};
