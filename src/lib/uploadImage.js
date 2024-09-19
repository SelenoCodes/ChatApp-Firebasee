import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "./firebase"

export const uploadImage = async(file, fileName) =>{
    const imageRef = ref(storage,`uploads/images/${Date.now()}-${fileName}`)
    const imageUpload =await uploadBytes(imageRef, file)
    const imageUrl = await getDownloadURL(ref(storage, imageUpload.ref.fullPath))
    return imageUrl
}