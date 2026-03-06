import { configureStore } from "@reduxjs/toolkit";
import dateRangeReducer from "./features/date-range-slice";

export const store = configureStore({
    reducer: {
        dateRange: dateRangeReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch