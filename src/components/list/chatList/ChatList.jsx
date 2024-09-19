import { useEffect, useState } from 'react'
import {db} from '../../../lib/firebase.js'
import {useUserStore} from '../../../lib/userStore.js'
import './chatList.css'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useChatStore } from '../../../lib/useChat.js'

const ChatList = () => {
  const [chats,setChats] = useState("")
  const {currentUser} = useUserStore((state)=>({
    currentUser:state.currentUser
  }))
  const { input, filterChats} = useChatStore((state)=>({
    input:state.input,
    filterChats: state.filterChats
  }))
  const {chatId,changeChat} = useChatStore((state)=>({
    changeChat:state.changeChat,
    chatId:state.chatId,
  }))



  useEffect(()=>{
    const unSub = onSnapshot(doc(db,'userchats',currentUser.id),async(res)=>{
      const items = res.data().chats


      // user info 

      const promises = items.map(async(item)=>{
        const userRef = doc(db,'users',item.receiverId);
        const userSnap = await getDoc(userRef)
        const user = userSnap.data()
      
        return {...item, user}
      })
      const chatData = await Promise.all(promises)
      setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt))

    })


    return ()=>{
      unSub();
    }
  },[currentUser.id])
  
  const filteredChats = filterChats(chats,input)
  console.log('chatid is ' , chatId)

  const handleChatClick =async (chat)=>{
    const userChats  = chats?.map((item)=>{
      const {user, ...rest} = item
      return rest
    })
    const chatIndex = userChats.findIndex(item=> item.chatId == chat.chatId)
    console.log(chatIndex)
    userChats[chatIndex].isSeen  = true
    try {
      const userRef = doc(db, 'userchats',currentUser.id)
      await updateDoc(userRef,{
        chats:userChats
      })


      changeChat(chat.chatId, chat.user)
    } catch (error) {
      
    }
    
  // try {
  //   const currUserChatRef = doc(db,'userchats',currentUser.id)
  //   const currUserChatSnap =await getDoc(currUserChatRef)
  //   if(currUserChatSnap.exists()){
  //    let chatsData=currUserChatSnap.data()

  //    const chatIndex = chatsData.chats.findIndex(c=>c.chatId == chatId)
  //   chatsData.chats[chatIndex].isSeen = true 
  //   await updateDoc(currUserChatRef,{
  //     chats:chatsData.chats
  //   })
    
  //   }
  // } catch (error) {
  //   console.log(error.message)
  // }

   
  }



  return (
    <div className='chatList'>   
    {/* ----ITEMS---- */}
       
       {
        filteredChats.length ?
        filteredChats.map((item)=>(
          <div className="item" key={item.chatId} onClick={()=>handleChatClick(item)}
          style={{background: item?.isSeen ? "" : "#5183fe"}}
          >
          <img src={item.user.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{item?.user.username}</span>
            <p>{item?.lastMessage}</p>
          </div>
        </div>
  
        ))

        :null
       }
    </div>
  )
}

export default ChatList