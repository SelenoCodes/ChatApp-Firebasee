import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";


export const useUserStore = create((set)=>({
    currentUser:null,
    isLoading:true,
    fetchUserInfo: async(uid)=>{
        if(!uid) return set({currentUser:null, isLoading:false})
            try {
               const userRef = doc(db,'users',uid)
               const userSnap =await getDoc(userRef)
        
               if(userSnap.exists()){
                return set({currentUser:userSnap.data(), isLoading:false})
               }
               else{
                return set({currentUser:null, isLoading:false})
               }
            } catch (error) {
                console.log(`Error fetching user info ${error}`)
                return set({currentUser:null, isLoading:false})
            }
    }
}))