import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ShoppingItem = { id: string; name: string; quantity: number; checked: boolean };

type ListsState = {
  activeListId: string | null;
  itemsByList: Record<string, ShoppingItem[]>;
};

const initialState: ListsState = { activeListId: null, itemsByList: {} };

const listSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {
    setActiveList(state, action: PayloadAction<string>) {
      state.activeListId = action.payload;
    },
    setItems(state, action: PayloadAction<{ listId: string; items: ShoppingItem[] }>) {
      state.itemsByList[action.payload.listId] = action.payload.items;
    },
  },
});

export const { setActiveList, setItems } = listSlice.actions;
export default listSlice.reducer;
