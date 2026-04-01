import { IMAGE_MIME_TYPES, MIME_TYPES } from "@/constants";

export type FileId = string & { _brand: "FileId" };

export type DataURL = string & { _brand: "DataURL" };

export type BinaryFileData = {
  id: FileId;
  dataURL: DataURL;
  mimeType:
    | (typeof IMAGE_MIME_TYPES)[keyof typeof IMAGE_MIME_TYPES]
    | typeof MIME_TYPES.binary;
  /**
   * Epoch timestamp in milliseconds
   */
  created: number;
  /**
   * Indicates when the file was last retrieved from storage to be loaded
   * onto the scene. We use this flag to determine whether to delete unused
   * files from storage.
   *
   * Epoch timestamp in milliseconds.
   */
  lastRetrieved?: number;
  /**
   * indicates the version of the file. This can be used to determine whether
   * the file dataURL has changed e.g. as part of restore due to schema update.
   */
  version?: number;
};

export type BinaryFileMetadata = Omit<BinaryFileData, "dataURL">;

export type BinaryFiles = Record<string, BinaryFileData>;

export type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
};

export type ImageElement = {
  type: "image";
  fileId: string;
  /** whether respective file is persisted */
  status: "pending" | "saved" | "error";
  /** X and Y scale factors <-1, 1>, used for image axis flipping */
  scale: [number, number];
  /** whether an element is cropped */
  crop: ImageCrop | null;
};
