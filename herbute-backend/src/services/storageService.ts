import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';
import { logger } from '../utils/logger.js';

const EXPORTS_DIR = path.join(process.cwd(), 'exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

export interface SaveResult {
  mode: 'local' | 'google_drive';
  filename: string;
  path?: string; // local path
  driveFileId?: string; // google drive id
  driveViewLink?: string; // google drive view link
  downloadUrl?: string; // local server download link
}

/**
 * Save a buffer locally to the /exports directory.
 */
export async function saveLocally(
  buffer: Buffer,
  filename: string,
  serverBaseUrl: string
): Promise<SaveResult> {
  const filePath = path.join(EXPORTS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  logger.info(`[Storage] File saved locally: ${filePath}`);
  return {
    mode: 'local',
    filename,
    path: filePath,
    downloadUrl: `${serverBaseUrl}/api/analytics/exports/download/${filename}`,
  };
}

/**
 * Upload a buffer to Google Drive using OAuth2 refresh token credentials.
 */
export async function saveToGoogleDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  refreshToken: string,
  folderId?: string
): Promise<SaveResult> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const { Readable } = await import('stream');
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);

  const requestBody: Record<string, string | string[]> = {
    name: filename,
    mimeType,
  };
  if (folderId) {
    requestBody.parents = [folderId];
  }

  const { data } = await drive.files.create({
    requestBody,
    media: {
      mimeType,
      body: readableStream,
    },
    fields: 'id, webViewLink',
  });

  logger.info(`[Storage] File uploaded to Google Drive: ${data.id}`);

  return {
    mode: 'google_drive',
    filename,
    driveFileId: data.id ?? undefined,
    driveViewLink: data.webViewLink ?? undefined,
  };
}

/**
 * Unified save function that dispatches to the correct driver.
 */
export async function saveExport(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  orgSettings: {
    exportStorage?: 'local' | 'google_drive';
    googleDriveRefreshToken?: string;
    googleDriveFolderId?: string;
  },
  serverBaseUrl: string
): Promise<SaveResult> {
  if (orgSettings.exportStorage === 'google_drive' && orgSettings.googleDriveRefreshToken) {
    return saveToGoogleDrive(
      buffer,
      filename,
      mimeType,
      orgSettings.googleDriveRefreshToken,
      orgSettings.googleDriveFolderId
    );
  }
  return saveLocally(buffer, filename, serverBaseUrl);
}
