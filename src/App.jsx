import React, { useEffect } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Auth from "./components/Auth/Auth";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "./lib/userStore";
import { auth } from "./lib/firebase";


const App = () => {
  const {currentUser,fetchUserInfo,isLoading} = useUserStore((state)=>({
    currentUser:state.currentUser,
    fetchUserInfo:state.fetchUserInfo,
    isLoading:state.isLoading
  }))

useEffect(()=>{
const unSub = onAuthStateChanged(auth,user=>{
  fetchUserInfo(user?.uid)
  console.log(user?.uid)
})


return ()=>{
  unSub()
}

},[onAuthStateChanged,fetchUserInfo])

  
  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          <Chat />
        </>
      ) : (
        <Auth />
      )}
      <Notification/>
    </div>
  );
};

export default App;
