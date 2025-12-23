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
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Placeholder for future S3/Cloudinary logic
export const uploadToCloud = async (file) => {
    throw new Error('Cloud storage not implemented yet');
};
