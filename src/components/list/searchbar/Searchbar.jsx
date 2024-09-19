import { useState } from 'react'
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import './searchbar.css'
import AddUser from '../addUser/AddUser';
import { useChatStore } from '../../../lib/useChat';

const Searchbar = () => {
    const [isOpen,setIsOpen] = useState(false)
    const {input, setInput} = useChatStore((state)=>({
      input:state.input,
      setInput:state.setInput,
    }))

  return (
    <div className="search">
        <div className="searchbar">
          <input type="text" placeholder='Search Chat...' value={input} onChange={e=>setInput(e.target.value)} />
        </div>
        {/* <img src={isOpen?<FaMinus/>:<FaPlus/>} alt="add icon" className='add' onClick={()=> setIsOpen(open=>!open)} /> */}
     <button className='add' onClick={()=> setIsOpen(open=>!open)}>
     {isOpen?<FaMinus/>:<FaPlus/>}
     </button>
     {isOpen && <AddUser/>}
      </div>
  )
}

export default Searchbar