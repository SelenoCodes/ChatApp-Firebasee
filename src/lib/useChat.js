import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId:null,
  user:null,
  isCurrentReceiverBlocked: false,
  isCurrentUserBlocked: false,
  // ----------------------------------------------
  input: "",
  setInput: (newInput) => set({ input: newInput }),
  filterChats: (chats, input) => {
    if(!Array.isArray(chats)) return [];
    return chats.filter((c) =>
      c.user.username.toLowerCase().includes(input.toLowerCase())
  );
},
// ----------------------------------------------
  changeChat: async(chatId, user) =>{
    const currentUser = useUserStore.getState().currentUser;

    if(currentUser.blocked.includes(user.id)){
  return set({
    chatId,
    user:null,
    isCurrentUserBlocked:false,
    isCurrentReceiverBlocked:true,
  })
    }

    else if(user.blocked.includes(currentUser.id)){
    return set({
      chatId,
      user:null,
      isCurrentUserBlocked:true,
      isCurrentReceiverBlocked:false,
    })
    }

    else{
      return set({
        chatId,
        user,
        isCurrentReceiverBlocked: false,
        isCurrentUserBlocked: false,
      })
    }

  },

  changeBlock: ()=>{
    set((state)=>({...state, isCurrentReceiverBlocked: !state.isCurrentReceiverBlocked}))
  }

}));
