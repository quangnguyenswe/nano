import { createStore, entries, del, getMany, set, setMany } from "idb-keyval";
import { FileManager } from "./FileManager";
import { BinaryFileData, BinaryFiles, FileId } from "@/types/file";
import { atom } from "@/store/jotai/app-jotai";
import { Locker } from "./Locker";
import { FileStatusStore } from "./FileStatusStore";
import { SAVE_TO_LOCAL_STORAGE_TIMEOUT, STORAGE_KEYS } from "@/constants";
import { debounce } from "@/utils";
import { updateBrowserStateVersion } from "./BrowserState";

const filesStore = createStore("files-db", "files-store");

export const localStorageQuotaExceededAtom = atom(false);

class LocalFileManager extends FileManager {
  clearObsoleteFiles = async (opts: { currentFileIds: FileId[] }) => {
    await entries(filesStore).then((entries) => {
      for (const [id, imageData] of entries as [FileId, BinaryFileData][]) {
        if (
          !imageData.lastRetrieved ||
          Date.now() - imageData.lastRetrieved > 24 * 60 * 60 * 1000 || // If not retrieved in the last 24 hours
          !opts.currentFileIds.includes(id as FileId) // Or if it's not in the current file IDs
        ) {
          del(id, filesStore); // Delete the obsolete file
        }
      }
    });
  };
}

type SavingLockTypes = "collaboration";

export class LocalData {
  private static _save = debounce(
    async (files: BinaryFiles, onFilesSaved: () => void) => {
      // saveDataStateToLocalStorage(elements, appState);

      await this.fileStorage.saveFiles({
        files,
      });
      onFilesSaved();
    },
    SAVE_TO_LOCAL_STORAGE_TIMEOUT,
  );

  static save = (files: BinaryFiles, onFilesSaved: () => void) => {
    // we need to make the `isSavePaused` check synchronously (undebounced)
    if (!this.isSavePaused()) {
      this._save(files, onFilesSaved);
    }
  };

  static flushSave = () => {
    this._save.flush();
  };

  private static locker = new Locker<SavingLockTypes>();

  static pauseSave = (lockType: SavingLockTypes) => {
    this.locker.lock(lockType);
  };

  static resumeSave = (lockType: SavingLockTypes) => {
    this.locker.unlock(lockType);
  };

  static isSavePaused = () => {
    return document.hidden || this.locker.isLocked();
  };

  static deleteFiles = async (fileIds: FileId[]) => {
    if (!fileIds.length) {
      return;
    }

    updateBrowserStateVersion(STORAGE_KEYS.VERSION_FILES);

    await Promise.all(
      fileIds.map(async (id) => {
        try {
          await del(id, filesStore);
        } catch (error) {
          console.warn(`Failed to delete file ${id} from IndexedDB:`, error);
        }
      }),
    );
  };

  static fileStorage = new LocalFileManager({
    onFileStatusChange: FileStatusStore.updateStatuses.bind(FileStatusStore),
    getFiles(ids) {
      return getMany(ids, filesStore).then(
        async (filesData: (BinaryFileData | undefined)[]) => {
          const loadedFiles: BinaryFileData[] = [];
          const erroredFiles = new Map<FileId, true>();

          const filesToSave: [FileId, BinaryFileData][] = [];

          filesData.forEach((data, index) => {
            const id = ids[index];
            if (data) {
              const _data: BinaryFileData = {
                ...data,
                lastRetrieved: Date.now(),
              };
              filesToSave.push([id, _data]);
              loadedFiles.push(_data);
            } else {
              erroredFiles.set(id, true);
            }
          });

          try {
            // save loaded files back to storage with updated `lastRetrieved`
            setMany(filesToSave, filesStore);
          } catch (error) {
            console.warn(error);
          }

          return { loadedFiles, erroredFiles };
        },
      );
    },

    async saveFiles({ addedFiles }) {
      const savedFiles = new Map<FileId, BinaryFileData>();
      const erroredFiles = new Map<FileId, BinaryFileData>();

      // before we use `storage` event synchronization, let's update the flag
      // optimistically. Hopefully nothing fails, and an IDB read executed
      // before an IDB write finishes will read the latest value.
      updateBrowserStateVersion(STORAGE_KEYS.VERSION_FILES);

      await Promise.all(
        [...addedFiles].map(async ([id, fileData]) => {
          try {
            await set(id, fileData, filesStore);
            savedFiles.set(id, fileData);
          } catch (error: any) {
            console.error(error);
            erroredFiles.set(id, fileData);
          }
        }),
      );

      return { savedFiles, erroredFiles };
    },
  });
}
