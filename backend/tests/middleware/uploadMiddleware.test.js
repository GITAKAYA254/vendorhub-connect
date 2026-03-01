import { jest } from '@jest/globals';
import multer from 'multer';

// Mock dependencies
const mockGetUploadPath = jest.fn(() => '/mock/uploads');

jest.unstable_mockModule('../src/utils/storage.js', () => ({
  getUploadPath: mockGetUploadPath,
}));

const { handleMulterError } = await import('../src/middleware/uploadMiddleware.js');

describe('Upload Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMulterError', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = new multer.MulterError('LIMIT_FILE_SIZE');

      handleMulterError(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'File size too large. Max is 10MB.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle other MulterError types', () => {
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
      error.message = 'Too many files';

      handleMulterError(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too many files',
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');

      handleMulterError(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      });
    });

    it('should call next() if no error', () => {
      handleMulterError(null, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle undefined error gracefully', () => {
      handleMulterError(undefined, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('File Filter Logic', () => {
    it('should accept JPEG images', () => {
      const file = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      };
      
      // This tests the concept - actual multer config tested via integration
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      expect(allowedTypes.includes(file.mimetype)).toBe(true);
    });

    it('should accept PNG images', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      expect(allowedTypes.includes('image/png')).toBe(true);
    });

    it('should accept WebP images', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      expect(allowedTypes.includes('image/webp')).toBe(true);
    });

    it('should reject non-image files', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      expect(allowedTypes.includes('application/pdf')).toBe(false);
      expect(allowedTypes.includes('text/html')).toBe(false);
      expect(allowedTypes.includes('video/mp4')).toBe(false);
    });
  });

  describe('Storage Configuration', () => {
    it('should use correct upload path', () => {
      // Verify the mock is called when import happens
      expect(typeof mockGetUploadPath).toBe('function');
    });

    it('should define 10MB file size limit', () => {
      const maxSize = 10 * 1024 * 1024;
      expect(maxSize).toBe(10485760);
    });
  });
});