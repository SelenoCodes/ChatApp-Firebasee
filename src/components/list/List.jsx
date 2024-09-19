import './list.css'
import ChatList from './chatList/ChatList'
import UserInfo from './userInfo/UserInfo'
import Searchbar from './searchbar/Searchbar'

const List = () => {
  return (
    <div className='list'>
      <UserInfo />
      <Searchbar/>
      <ChatList />
    </div>
  )
}

export default List