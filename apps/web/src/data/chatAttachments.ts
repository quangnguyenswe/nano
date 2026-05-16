import { LocalData } from "./LocalData";
import type { BinaryFileData, BinaryFiles, FileId } from "@/types/file";
import type { ChatMessageAttachment } from "@/types/message";

export const saveChatAttachment = async (attachment: ChatMessageAttachment) => {
  if (!attachment.dataURL) {
    return;
  }

  const fileId = attachment.id as FileId;
  const files: BinaryFiles = {
    [fileId]: {
      id: fileId,
      dataURL: attachment.dataURL as BinaryFileData["dataURL"],
      mimeType: attachment.mediaType as BinaryFileData["mimeType"],
      created: Date.now(),
      lastRetrieved: Date.now(),
    },
  };

  await LocalData.fileStorage.saveFiles({ files });
};

export const loadChatAttachment = async (fileId: string) => {
  const { loadedFiles } = await LocalData.fileStorage.getFiles([
    fileId as FileId,
  ]);

  return loadedFiles[0] ?? null;
};

export const deleteChatAttachments = async (fileIds: string[]) => {
  await LocalData.deleteFiles(fileIds.map((fileId) => fileId as FileId));
};
