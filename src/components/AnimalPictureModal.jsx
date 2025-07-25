import { useState, useEffect } from 'react';
import { Modal, Button, Carousel, Form } from 'react-bootstrap';
import { FaStar, FaEdit, FaUpload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import axios from 'axios';



function AnimalPictureModal({ show, selectedNode }) {
  const { user } = useAuth(); // Get user from AuthContext
  const [image, setImages] = useState(); // State for images
  const [comments, setComments] = useState([]);
  const fileInputRef = useRef();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const { userName, animal, imgPath } = useParams();
  const navigate = useNavigate();
  const handleClose = () => navigate(-1); // 👈 This goes back to the previous page
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_WILD_LENS_BACKEND_BASE_URL;
  const token = localStorage.getItem("authToken"); // or wherever you store it

  useEffect(() => {
    setImages(imgPath);
    RetrieveComments();
    RetrieveLikes();
    RetrieveUserReactions();
  }, []); // Fetch images when modal is shown


    const RetrieveUserReactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PictureReaction/GetUserReactions/${encodeURIComponent(imgPath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setHasLiked(response.data.hasLiked);
        setHasDisliked(response.data.hasDisliked);
      }
    } catch (error) {
      console.error('Error retrieving likes:', error);
    }
  };

  const RetrieveLikes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PictureReaction/GetAllLikes/${encodeURIComponent(imgPath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setLikes(response.data); // Assuming the backend returns the like count directly
      }
    } catch (error) {
      console.error('Error retrieving likes:', error);
    }
  };


  const RetrieveComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/PictureReaction/GetAllComments/${encodeURIComponent(imgPath)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response);
      if (response.status != 200) {
        alert('Failed to get comment.');
        return;
      }
      console.log(response.data[0].comment);
      setComments(response.data);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/PictureReaction/commentPicture?imagePath=${encodeURIComponent(imgPath)}&comment=${newComment}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        alert('Failed to post comment.');
        return;
      }

      RetrieveComments();
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEditClick = () => {
    console.log("edit clicked");
    setShowDeleteIcons(!showDeleteIcons);
  };

  const handleDeleteImage = async (index) => {
    console.log(images[index]);
    try {
      // Create FormData to send the file
      console.log("animal " + animal)
      const formData = new FormData();
      formData.append('imagePath', images[index]);
      // Upload the image
      const response = await fetch(API_BASE_URL + "/Catalog/DeletePicture", {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Use JWT Token
          // Don't set Content-Type header when using FormData
        },
        body: formData
      });

      if (!response.ok) {
        alert('Failed to delete image. Please try again.');
        console.error('Error uploading image:', error);

      }
      fetchImages();

    } catch (error) {

    }
  };

  const handleLike = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/PictureReaction/likePicture?imagePath=${encodeURIComponent(imgPath)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      
      setHasLiked(!hasLiked);
      RetrieveLikes();
    }
  } catch (error) {
    console.error('Error liking image:', error);
  }
};

const handleDislike = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/PictureReaction/dislikePicture?imagePath=${encodeURIComponent(imgPath)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      setHasDisliked(!hasDisliked);
    }
  } catch (error) {
    console.error('Error disliking image:', error);
  }
};

  return (
    <Modal show={true} onHide={handleClose} centered dialogClassName="custom-modal" id="animal-modal">
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title>{selectedNode}</Modal.Title>
        <div className="d-flex align-items-center">
          <Button variant="close" onClick={handleClose} />
        </div>
      </Modal.Header>
      <Modal.Body>
        <div id='container-picture' className="d-flex">
          <div className="d-flex flex-column align-items-center flex-grow-1">
            <img src={image} alt={`Animal`} className="img-fluid rounded-lg" />
          </div>

          <div id="comment-section" className="border rounded p-3" style={{ width: '400px' }}>
            <div className="comment-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {comments.map((comment, index) => (
                <div key={index} className="border-bottom pb-2">
                  <div className="d-flex flex-column">
                    {/* Username on top */}
                    <strong className="text-primary mb-1">{comment.userName}</strong>

                    {/* Comment content */}
                    <span style={{ wordBreak: 'break-word' }}>{comment.comment}</span>
                  </div>

                  {/* Date underneath, aligned to the right */}
                  <div className="text-end text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(comment.commentDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>


            <Form.Group className="mt-3">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button className="mt-2 w-100" variant="primary" onClick={handleCommentSubmit}>
                Post Comment
              </Button>
            </Form.Group>

            <div className="mt-4 text-center">
              <div className="d-flex justify-content-center align-items-center gap-3">
                <Button
                  variant={hasLiked ? "success" : "outline-success"}
                  onClick={handleLike}
                >
                  👍 Like ({likes})
                </Button>
                <Button
                  variant={hasDisliked ? "danger" : "outline-danger"}
                  onClick={handleDislike}
                >
                  👎 Dislike
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AnimalPictureModal;