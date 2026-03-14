export interface ParseResponse {
    filenames: string[];
    total_transactions: number;
    transactions: any[];
    metadata: {
        file_count: number;
        total_size: number;
    };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const parsePdfWithPython = async (files: File[], password?: string): Promise<ParseResponse> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

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
