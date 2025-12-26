export const successResponse = (data = null) => ({
  success: true,
  data,
  error: null,
});

export const errorResponse = (message, data = null) => ({
  success: false,
  data,
  error: message,
});




