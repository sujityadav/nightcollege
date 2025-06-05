'use client'; // This is required to use client-side components in Next.js app directory
import React from 'react'
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';


export const StoreProvider = ({children}) => {
  return  <Provider store={store}><PersistGate loading={null} persistor={persistor}>{children}</PersistGate> </Provider>;

}

