import { useState } from "react";
import sendButton from "../assets/send-button.png";

export default function CommentSection({ expenseId }) {
  const [comments, setComments] = useState([
    // Sample comments for demonstration
    {
      id: 1,
      author: "John Doe",
      text: "Thanks for covering this! Will pay you back tomorrow.",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 2,
      author: "Jane Smith", 
      text: "Great dinner spot! We should go there again.",
      timestamp: new Date().toLocaleString()
    }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: "You",
        text: newComment.trim(),
        timestamp: new Date().toLocaleString()
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="w-full">
      {/* Comments Display */}
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 font-['Poppins']">
              No comments yet. Be the first to add one!
            </div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-semibold">
                    {comment.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-900 font-medium font-['Poppins'] text-sm">
                      {comment.author}
                    </span>
                    <span className="text-gray-500 text-xs font-['Poppins']">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-700 font-['Poppins'] text-sm">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="relative">
        <div className="bg-gray-50 rounded-lg border border-gray-200 focus-within:border-gray-300 transition-colors">
          <textarea
            className="w-full bg-transparent resize-none outline-none text-gray-900 font-['Poppins'] placeholder-gray-500 p-3 pr-12"
            rows="2"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="absolute bottom-2 right-2 bg-gray-900 hover:bg-gray-800 transition-colors rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <img src={sendButton} alt="Send" className="w-4 h-4 filter invert" />
          </button>
        </div>
        
        <div className="text-gray-400 text-xs font-['Poppins'] mt-2 text-center">
          Press Enter to send
        </div>
      </div>
    </div>
  );
}

