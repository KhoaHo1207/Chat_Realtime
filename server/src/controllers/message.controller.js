import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
export const getUserForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUser);
  } catch (error) {
    console.error("Error in getUserForSideBar:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.body;

    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      //upload base 64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //todo: realtime functional goes here => socket.io
    res.status(201).json({
      newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
