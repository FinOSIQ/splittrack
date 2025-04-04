import { useState } from "react";
import sendButton from "../assets/send-button.png"; 

export default function CommentSection() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6">
      
      <h2 className="text-[#040b2b] text-2xl font-normal font-['Poppins'] leading-[24.94px] mb-2">
        Comments
      </h2>

      
      <div className="w-[1128px] p-4 bg-white min-h-[100px] rounded-xl">
        {comments.length === 0 ? (
          <p className="text-[#61677d] text-2xl font-normal font-['Poppins'] leading-[24.94px] italic text-center">
            No comments yet.
          </p>
        ) : (
          <ul>
            {comments.map((comment, index) => (
              <li key={index} className="border-b py-2 last:border-b-0">
                {/* Display each comment here */}
                <div className="text-gray-800">
                  <strong>Commenter {index + 1}:</strong> {comment}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comment Input Section with the provided styles */}
      <div className="w-[1128px] h-[83.35px] px-[24.94px] py-[18.71px] bg-[#f1f2f9] rounded-xl relative mt-4">
        <input
          className="w-full h-full p-3 pr-14 bg-transparent rounded-xl" // Removed border class
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="absolute top-4 right-2 bg-transparent p-1" // Adjusted top value to lower the button
          onClick={handleAddComment}
        >
          <img src={sendButton} alt="Send" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

