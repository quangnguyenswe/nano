export class Locker<T extends string> {
  private locks = new Set<T>();

  lock = (lockType: T) => {
    this.locks.add(lockType);
  };

  unlock = (lockType: T) => {
    this.locks.delete(lockType);
    return !this.isLocked();
  };

  isLocked(lockType?: T) {
    return lockType ? this.locks.has(lockType) : !!this.locks.size;
  }
}
