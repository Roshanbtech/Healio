// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { combineReducers } from 'redux';
// // import userSlice from './Slice/userSlice';
// // import doctorSlice from './Slice/doctorSlice';
// // import adminSlice from './Slice/adminSlice';

// // Define persist configuration
// const persistConfig = {
//   key: 'root',
//   storage,
// };

// // Combine reducers
// const rootReducer = combineReducers({
//   user: userSlice,
//   doctor: doctorSlice,
//   admin: adminSlice,
// });

// // Create persisted reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Configure store
// const store = configureStore({
//   reducer: persistedReducer,
// });

// // Create persistor
// const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// // Named exports
// export { store, persistor };
