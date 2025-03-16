export const startOfToday = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  
  export const endOfToday = (): Date => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  };
  
  export const startOfMonth = (): Date => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };
  
  export const endOfMonth = (): Date => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  };
  