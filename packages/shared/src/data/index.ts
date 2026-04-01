import { CHAT_ROOM_ID_BYTES } from "../constants";
import { bytesToHexString } from "../utils";

export { compressData, decompressData } from "../data/encode";
export {
  createIV,
  generateEncryptionKey,
  getCryptoKey,
  encryptData,
  decryptData,
} from "../data/encryption";
export { blobToArrayBuffer } from "../data/blob";

export const generateRoomId = async () => {
  const buffer = new Uint8Array(CHAT_ROOM_ID_BYTES);
  globalThis.crypto.getRandomValues(buffer);
  return bytesToHexString(buffer);
};
