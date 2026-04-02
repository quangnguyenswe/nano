import {
  BinaryFileData,
  BinaryFileMetadata,
  BinaryFiles,
  FileId,
  ImageElement,
} from "@/types/file";
import { compressData } from "@nano/shared";

type FileVersion = Required<BinaryFileData>["version"];
export class FileManager {
  private fetchingFiles = new Map<ImageElement["fileId"], true>();
  private erroredFiles_fetch = new Map<ImageElement["fileId"], true>();

  private savingFiles = new Map<ImageElement["fileId"], FileVersion>();
  private savedFiles = new Map<ImageElement["fileId"], FileVersion>();
  private erroredFiles_save = new Map<ImageElement["fileId"], FileVersion>();

  private _getFiles;
  private _saveFiles;
  private _onFileStatusChange;

  constructor({
    getFiles,
    saveFiles,
    onFileStatusChange,
  }: {
    getFiles: (fileIds: FileId[]) => Promise<{
      loadedFiles: BinaryFileData[];
      erroredFiles: Map<FileId, true>;
    }>;
    saveFiles: (data: { addedFiles: Map<FileId, BinaryFileData> }) => Promise<{
      savedFiles: Map<FileId, BinaryFileData>;
      erroredFiles: Map<FileId, BinaryFileData>;
    }>;
    onFileStatusChange?: (
      updates: Array<[FileId, "loading" | "loaded" | "error"]>,
    ) => void;
  }) {
    this._getFiles = getFiles;
    this._saveFiles = saveFiles;
    this._onFileStatusChange = onFileStatusChange;
  }

  isFileTracked = (id: FileId) => {
    return (
      this.savedFiles.has(id) ||
      this.savingFiles.has(id) ||
      this.fetchingFiles.has(id) ||
      this.erroredFiles_fetch.has(id) ||
      this.erroredFiles_save.has(id)
    );
  };

  isFileSavedOrBeingSaved = (file: BinaryFileData) => {
    const fileVersion = this.getFileVersion(file);
    return (
      this.savedFiles.get(file.id) === fileVersion ||
      this.savingFiles.get(file.id) === fileVersion
    );
  };

  getFileVersion = (file: BinaryFileData): FileVersion => {
    return file.version ?? 1;
  };

  //TODO: Check back this function
  saveFiles = async ({ files }: { files: BinaryFiles }) => {
    const addedFiles: Map<FileId, BinaryFileData> = new Map();

    // for (const element of elements) {
    //   const fileData =
    //     isInitializedImageElement(element) && files[element.fileId];

    //   if (
    //     fileData &&
    //     // NOTE if errored during save, won't retry due to this check
    //     !this.isFileSavedOrBeingSaved(fileData)
    //   ) {
    //     addedFiles.set(element.fileId, files[element.fileId]);
    //     this.savingFiles.set(element.fileId, this.getFileVersion(fileData));
    //   }
    // }

    try {
      const { savedFiles, erroredFiles } = await this._saveFiles({
        addedFiles,
      });

      for (const [fileId, fileData] of savedFiles) {
        this.savedFiles.set(fileId, this.getFileVersion(fileData));
      }

      for (const [fileId, fileData] of erroredFiles) {
        this.erroredFiles_save.set(fileId, this.getFileVersion(fileData));
      }

      return {
        savedFiles,
        erroredFiles,
      };
    } finally {
      for (const [fileId] of addedFiles) {
        this.savingFiles.delete(fileId);
      }
    }
  };

  getFiles = async (ids: FileId[]) => {
    if (!ids.length) {
      return {
        loadedFiles: [],
        erroredFiles: new Map(),
      };
    }
    for (const id of ids) {
      this.fetchingFiles.set(id, true);
    }

    this._onFileStatusChange?.(ids.map((id) => [id, "loading"]));

    try {
      const { loadedFiles, erroredFiles } = await this._getFiles(ids);

      for (const file of loadedFiles) {
        this.savedFiles.set(file.id, this.getFileVersion(file));
      }
      for (const [fileId] of erroredFiles) {
        this.erroredFiles_fetch.set(fileId, true);
      }

      this._onFileStatusChange?.([
        ...loadedFiles.map((file) => [file.id, "loaded"] as [FileId, "loaded"]),
        ...Array.from(erroredFiles.keys()).map(
          (fileId) => [fileId, "error"] as [FileId, "error"],
        ),
      ]);

      return {
        loadedFiles,
        erroredFiles,
      };
    } finally {
      for (const id of ids) {
        this.fetchingFiles.delete(id);
      }
    }
  };

  reset() {
    if (this._onFileStatusChange && this.fetchingFiles.size) {
      this._onFileStatusChange(
        [...this.fetchingFiles.keys()].map(
          (id) => [id, "error"] as [FileId, "error"],
        ),
      );
    }
    this.fetchingFiles.clear();
    this.savingFiles.clear();
    this.savedFiles.clear();
    this.erroredFiles_fetch.clear();
    this.erroredFiles_save.clear();
  }
}

export const encodeFilesForUpload = async ({
  files,
  maxBytes,
  encryptionKey,
}: {
  files: Map<FileId, BinaryFileData>;
  maxBytes: number;
  encryptionKey: string;
}) => {
  const processedFiles: {
    id: FileId;
    buffer: Uint8Array;
  }[] = [];

  for (const [id, fileData] of files) {
    const buffer = new TextEncoder().encode(fileData.dataURL);

    const encodedFile = await compressData<BinaryFileMetadata>(buffer, {
      encryptionKey,
      metadata: {
        id,
        mimeType: fileData.mimeType,
        created: Date.now(),
        lastRetrieved: Date.now(),
      },
    });

    if (buffer.byteLength > maxBytes) {
      throw new Error(
        `File ${id} exceeds the maximum allowed size of ${maxBytes} bytes.`,
      );
    }
    processedFiles.push({
      id,
      buffer: encodedFile,
    });
  }
  return processedFiles;
};
