from fastapi import Request, status
from fastapi.responses import JSONResponse

class GuardianException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class InvalidImageError(GuardianException):
    def __init__(self, message: str = "Invalid or unreadable image provided."):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class LLMProcessingError(GuardianException):
    def __init__(self, message: str = "Failed to process image with AI model."):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)

async def guardian_exception_handler(request: Request, exc: GuardianException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_type": exc.__class__.__name__},
    )
