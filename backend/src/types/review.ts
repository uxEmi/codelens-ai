export interface ReviewRequest {
        code: string;
}

export interface ErrorResponse {
        error: string;
}

export interface ReviewResponse {
	id: number;
	code: string;
	result: string | null;
	createdAt: Date;
}

