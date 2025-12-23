import fs from 'fs';
import path from 'path';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getUploadPath = () => UPLOAD_DIR;

export const deleteFile = async (filePath) => {
    try {
        if (!filePath) return;

        // Prevent null byte injection
        if (filePath.indexOf('\0') !== -1) {
            console.warn('Invalid file path with null bytes');
            return;
        }

        const baseDir = process.cwd();
        const resolved = path.resolve(baseDir, filePath);

        // Prevent path traversal: ensure resolved path is within baseDir
        const relative = path.relative(baseDir, resolved);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            console.warn(`Path traversal attempt prevented: ${filePath}`);
            return;
        }

        // Direct unlink to avoid TOCTOU race condition (no existsSync)
        await fs.promises.unlink(resolved);
    } catch (error) {
        // Ignore file not found errors
        if (error.code !== 'ENOENT') {
            console.error('Error deleting file:', error);
        }
    }
};

// Placeholder for future S3/Cloudinary logic
export const uploadToCloud = async (file) => {
    throw new Error('Cloud storage not implemented yet');
};
