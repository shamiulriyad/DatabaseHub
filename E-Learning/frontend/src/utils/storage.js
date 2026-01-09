export const storage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};
