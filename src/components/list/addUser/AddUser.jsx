import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import './AddUser.css'
import { db } from '../../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../lib/userStore';

const AddUser = () => {
  const [user,setUser] = useState("")
  const {currentUser} = useUserStore((state)=>({
    currentUser:state.currentUser
  }))

  // -----Search User-----
  const hanldeSearch = async e =>{
    e.preventDefault();
    try {
      const formData = new FormData(e.target)
      const username = formData.get('username')
      const q = query(collection(db,'users'),where('username','==',username))
      const userSnap =await getDocs(q)
      if(!userSnap.empty){
        setUser(userSnap.docs[0].data())
      }
    } catch (error) {
      console.log(error)
    }
  }


  // ------ Add Chat ------- 

  const handleChat =async () =>{
    try {
      const userChatsRef = collection(db,'userchats')
      const chatRef = collection(db,'chats')
      const newChatRef = doc(chatRef)

      // ----setting up chats---
      await setDoc(newChatRef,{
        messages:[],
        cretedAt:serverTimestamp()
      })

      // ---updating both userChats----
      await updateDoc(doc(userChatsRef,user.id),{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          receiverId:currentUser.id,
          updatedAt:Date.now()
        })
      })
      
      await updateDoc(doc(userChatsRef,currentUser.id),{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          receiverId:user.id,
          updatedAt:Date.now()
        })
      })


    } catch (error) {
      console.log(error)
      
    }
  }

  return (
    <div className='addUser'>
        <form onSubmit={hanldeSearch}>
            <input type="text" name='username' placeholder='Username' />
            <button>Search</button>
        </form>
        <div className="user">
            <div className="details">
                <img src={user?.avatar||'./avatar.png'} alt="avtar" />
                <span>{user?.username}</span>
            </div>
            <button onClick={handleChat}>Add User</button>
        </div>

    </div>
  )
}

export default AddUser