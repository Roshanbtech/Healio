"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endOfMonth = exports.startOfMonth = exports.endOfToday = exports.startOfToday = void 0;
const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};
exports.startOfToday = startOfToday;
const endOfToday = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
};
exports.endOfToday = endOfToday;
const startOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
};
exports.startOfMonth = startOfMonth;
const endOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
};
exports.endOfMonth = endOfMonth;
