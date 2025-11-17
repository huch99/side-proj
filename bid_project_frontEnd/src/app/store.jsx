import { configureStore } from '@reduxjs/toolkit';
import tendersReducer from '../features/tenders/tenderSlicce'; 
import loginReducer from '../features/login_signup/loginSlice';
import myBidsReducer from '../features/bids/myBidsSlice';

export const store = configureStore({

    reducer : {
        tenders : tendersReducer,
        login : loginReducer,
        myBids: myBidsReducer,
    },
});