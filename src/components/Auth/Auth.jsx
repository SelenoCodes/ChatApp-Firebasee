import { useState } from "react";
import "./auth.css";
import { toast } from "react-toastify";
import { auth, db } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { uploadImage } from "../../lib/uploadImage";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const [loginLoader, setLoginLoader] = useState(false);
  const [registerLoader, setRegisterLoader] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // ___Handle Registration___
  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const { username, email, password } = Object.fromEntries(formData);
      setRegisterLoader(true);

      // ---create user --
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) {
        toast.success("User created successfully");
        let userId = user.user.uid;

        // Upload profile if povided
        let profilePic = null;
        if (avatar.file) {
          try {
            profilePic = await uploadImage(avatar.file, avatar.file.name);
          } catch (error) {
            console.log(error.message);
            toast.error("Failed to upload profile image.");
            return;
          }
        }

        // ----set up user data----
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
          username,
          email,
          id: userId,
          blocked: [],
          about: "Edit About",
          ...(profilePic && { avatar: profilePic }),
        });

        // ---set up user chats----
        const userChatsRef = doc(db, "userchats", userId);
        await setDoc(userChatsRef, {
          chats: [],
        });
      }
    } catch (error) {
      toast.error("whoops! Something went wrong");
      console.log(error);
    } finally {
      setRegisterLoader(false);
    }
  };

  //  ----HANDLE LOGIN----

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);
      setLoginLoader(true);
      const signInuser = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (signInuser) {
        toast.success("User Logged in!");
      }
    } catch (error) {
      toast.error("Whoops! something went wrong");
      console.log(error);
    } finally {
      setLoginLoader(false);
    }
  };

  return (
    <div className="auth">
      <div className="item">
        <h2>Welcome back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="email" required placeholder="Eamil..." />
          <input
            type="password"
            name="password"
            required
            placeholder="Password..."
          />
          <button disabled={false}>
            {loginLoader ? "Loading..." : "Login"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create User</h2>
        <form onSubmit={handleRegistration}>
          <img
            src={avatar.url || "./avatar.png"}
            alt="avatar"
            className="avatar"
          />
          <label htmlFor="file">Upload an image</label>
          <input
            type="file"
            name="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            name="username"
            required
            placeholder="Username..."
          />
          <input type="text" name="email" required placeholder="Eamil..." />
          <input
            type="password"
            name="password"
            required
            placeholder="Password..."
          />
          <button>{registerLoader ? "Loading..." : "Sign up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
