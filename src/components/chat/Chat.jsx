import { RiSendPlaneLine } from "react-icons/ri";
import { ImAttachment } from "react-icons/im";
import { MdEmojiEmotions } from "react-icons/md";
import { MdOutlineBlock } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { uploadImage } from "../../lib/uploadImage";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import { format } from "timeago.js";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/useChat";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const { chatId, user, changeBlock, isCurrentReceiverBlocked, isCurrentUserBlocked } = useChatStore((state) => ({
    chatId: state.chatId,
    user: state.user,
    changeBlock: state.changeBlock,
    isCurrentReceiverBlocked:state.isCurrentReceiverBlocked,
    isCurrentUserBlocked:state.isCurrentUserBlocked,
  }));

  const { currentUser } = useUserStore((state) => ({
    currentUser: state.currentUser,
  }));
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [emojiOpen, setEmojiOpen] = useState(false);
  const scrollRef = useRef();
  const handleEmoji = (e) => {
    setText((prevText) => prevText + e.emoji);
    setEmojiOpen(false);
  };

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // ---fetch the chats on mounting----

  useEffect(() => {
    if (chatId) {
      let unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
        setChats(res.data());
      });

      return () => {
        unSub();
      };
    }
  }, [chatId]);

  // -----Handle Send-----
  const handleSend = async () => {
    if (text === "" && img === null) return;
    let imgUrl = null;
    if (img.file) {
      imgUrl = await uploadImage(img.file, img.file.name);
    }
    try {
      // ----updating the chat with messages--
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text,
          senderId: currentUser.id,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
      setText("");
      setImg({ file: null, url: "" });
      // -------updating current user chats ----
      const currUserChatRef = doc(db, "userchats", currentUser.id);
      const currUserChatSnap = await getDoc(currUserChatRef);
      if (currUserChatSnap.exists()) {
        let chatsData = currUserChatSnap.data();

        const chatIndex = chatsData.chats.findIndex((c) => c.chatId == chatId);
        chatsData.chats[chatIndex].text = text;
        chatsData.chats[chatIndex].isSeen = true;
        chatsData.chats[chatIndex].updatedAt = Date.now();
        await updateDoc(currUserChatRef, {
          chats: chatsData.chats,
        });
      }

      // ----updating other user chats ----

      // -------updating current user chats ----
      const otherUserChatRef = doc(db, "userchats", user.id);
      const otherUserChatSnap = await getDoc(otherUserChatRef);
      if (otherUserChatSnap.exists()) {
        let chatsData = otherUserChatSnap.data();

        const chatIndex = chatsData.chats.findIndex((c) => c.chatId == chatId);
        chatsData.chats[chatIndex].lastMessage = text;
        chatsData.chats[chatIndex].isSeen = false;
        chatsData.chats[chatIndex].updatedAt = Date.now();
        await updateDoc(otherUserChatRef, {
          chats: chatsData.chats,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // ----Handle block---

  const handleBlock = async ()=>{
    try {
      const userRef = doc(db,'users',currentUser.id)
      await updateDoc(userRef,{
        blocked: isCurrentReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
      })
      changeBlock()
    } catch (error) {
      console.log(error.message)
    }
  }



  return (
    <div className="chat">
      {/* ---TOP--- */}
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./levi.png"} alt="avatar" />
          <div className="texts">
            <h3>{user?.username}</h3>
            <span>{user?.about}</span>
          </div>
        </div>
        <div className="icons">
          <IoVideocam className="icon" />
          <FaPhoneAlt className="icon" />
          <MdOutlineBlock className="icon" onClick={handleBlock} />
        </div>
      </div>
      {/* ----CENTER---- */}
      <div className="center">
        {chatId ? (
          <>
            {chats?.messages?.map((message, index) => (
              <div
                className={
                  message?.senderId === currentUser.id
                    ? "message own"
                    : "message"
                }
                key={index}
              >
               {message?.senderId != currentUser.id &&  <img src={user?.avatar} alt="avatar" />}
                <div className="texts">
                  {message?.img && <img src={message?.img} alt="" />}
                  {message?.text && <p>{message?.text}</p>}
                  <span>{format(message.createdAt.toDate())}</span>
                </div>
              </div>
            ))}

            <div ref={scrollRef}></div>
          </>
        ) : (
          <div className="chatIdMessage">
            Please select a chat to start conversation
          </div>
        )}
      </div>
      {/* -----BOTTOM----- */}
      <div className="bottom">
        <div className="text">
          <label htmlFor="file">
            <ImAttachment className="attachment" />
          </label>
          <input
            type="file"
            name="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          <input
            type="text"
            placeholder={isCurrentReceiverBlocked || isCurrentUserBlocked ? "Can not send message" : "Write Your Text here...."}
            value={text}
            disabled={isCurrentReceiverBlocked || isCurrentUserBlocked}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />
          <div className="emoji">
            <MdEmojiEmotions onClick={() => setEmojiOpen(!emojiOpen)} />
            <div className="emojiPicker">
              <EmojiPicker open={emojiOpen} onEmojiClick={handleEmoji} />
            </div>
          </div>
        </div>
        <div className="sendBtn" onClick={handleSend}>
          <RiSendPlaneLine  />
        </div>
      </div>
    </div>
  );
};

export default Chat;
