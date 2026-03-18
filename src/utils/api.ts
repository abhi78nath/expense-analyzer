export interface ParseResponse {
    filenames: string[];
    total_transactions: number;
    transactions: any[];
    metadata: {
        file_count: number;
        total_size: number;
        pdfs?: { id: string; filename: string }[];
    };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const parsePdfWithPython = async (files: File[], userId?: string | null, password?: string): Promise<ParseResponse> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    if (userId) {
        formData.append('user_id', userId);
    }

    if (password) {
        formData.append('password', password);
    }

    const response = await fetch(`${API_BASE_URL}/parse-pdf`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse PDF(s) with Python API');
    }

    return response.json();
};
export const getTransactionTags = async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/transaction-tags`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch transaction tags');
    }

    return response.json();
};

export const addMerchantRule = async (rule: { merchant: string; category: string; tag: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/merchant-rules`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add merchant rule');
    }

    return response.json();
};
export const updateMerchantRule = async (id: number, rule: { merchant: string; category: string; tag: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/merchant-rules/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update merchant rule');
    }

    return response.json();
};

export const deleteMerchantRule = async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/merchant-rules/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete merchant rule');
    }

    return response.json();
};
