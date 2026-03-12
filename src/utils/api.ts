export interface ParseResponse {
    filename: string;
    total_transactions: number;
    transactions: any[][];
    metadata: {
        content_type: string;
        size: number;
    };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const parsePdfWithPython = async (file: File, password?: string): Promise<ParseResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
        formData.append('password', password);
    }

    const response = await fetch(`${API_BASE_URL}/parse-pdf`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to parse PDF with Python API');
    }

    return response.json();
};
