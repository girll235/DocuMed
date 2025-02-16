export class AppError extends Error {
    constructor(
      message: string,
      public code: string,
      public status: number
    ) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  export const handleError = (error: unknown): { message: string; status: number } => {
    if (error instanceof AppError) {
      return {
        message: error.message,
        status: error.status
      };
    }
    
    console.error('Error:', error);
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    };
  };