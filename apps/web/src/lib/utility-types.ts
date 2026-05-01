
// Makes all properties of T mutable (removes readonly modifier)
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Makes all properties of T optional
export type ValueOf<T> = T[keyof T];