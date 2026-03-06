import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DateRange } from 'react-day-picker'

interface DateRangeState {
    dateRange: DateRange | undefined
}

const initialState: DateRangeState = {
    dateRange: undefined
}

const dateRangeSlice = createSlice({
    name: "dateRange",
    initialState,
    reducers: {
        setDateRange: (state, action: PayloadAction<DateRange | undefined>) => {
            state.dateRange = action.payload
        }
    }
})

export const { setDateRange } = dateRangeSlice.actions
export default dateRangeSlice.reducer