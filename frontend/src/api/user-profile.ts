import axios from '@/services/axios';

export interface UpdateNameRequest {
    name: string;
}

export interface UpdateEmailRequest {
    email: string;
    password: string;
}

export interface UpdatePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    user?: any;
}

export const updateUserName = async (data: UpdateNameRequest): Promise<ApiResponse> => {
    const response = await axios.put('/user/profile/name', data);
    return response.data;
};

export const updateUserEmail = async (data: UpdateEmailRequest): Promise<ApiResponse> => {
    const response = await axios.put('/user/profile/email', data);
    return response.data;
};

export const updateUserPassword = async (data: UpdatePasswordRequest): Promise<ApiResponse> => {
    const response = await axios.put('/user/profile/password', data);
    return response.data;
};
