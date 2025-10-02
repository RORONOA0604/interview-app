// src/store/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import candidateReducer from './candidateSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({ candidate: candidateReducer });

const persistConfig = { key: 'root', storage, whitelist: ['candidate'] };
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // ✅ FIX: Add this middleware to ignore redux-persist's non-serializable actions.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);