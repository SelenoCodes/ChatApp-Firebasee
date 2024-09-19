import { CiEdit } from "react-icons/ci";
import './userInfo.css'
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useEffect, useState } from "react";

const UserInfo = () => {
  const currentUser = useUserStore.getState().currentUser;
  const [about, setAbout] = useState('')
  const [openAbout, setOpenAbout] = useState(false)
  const [user,setUser] = useState("")

const handleEditAbout =async (e)=>{
  e.preventDefault()

  const userRef = doc(db,'users',currentUser.id)
  await updateDoc(userRef,{
    about
  })
  setOpenAbout(false)
}

useEffect(()=>{
  const unSub = onSnapshot(doc(db,'users',currentUser.id), async(res)=>{
        setUser(res.data())
  })
  return ()=>{
    unSub()
  }
},[about,currentUser.id])
  return (
    <div className='userInfo'>
      <div className="user">
        <img src={user.avatar || "./avatar.png"} alt="" />
       <div className="userDetails">
       <h3>{user?.username}</h3>
       <div className="about">
     {!openAbout &&   <span>{user?.about?.slice(0,30)}...</span>}
      <form onSubmit={handleEditAbout}>
      {openAbout &&  <input type="text" placeholder="About yourself..." value={about} onChange={e=>setAbout(e.target.value)} />}
      </form>
       <CiEdit className="edit" onClick={(()=>setOpenAbout(!openAbout))} />
       </div>
       </div>
      </div>
    </div>
  )
}

export default UserInfo