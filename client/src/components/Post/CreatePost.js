import React, { useState } from 'react';
import './Post.css';
import { createPost, s3Upload } from '../../api/posts';

function CreatePost(props) {
  const { username } = props;
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isImage, setIsImage] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState(null);

  function handleTitleChange(event) {
    setPostTitle(event.target.value);
    // console.log('Title changed', event.target.value);
  }

  function handleContentChange(event) {
    setPostContent(event.target.value);
    // console.log('Content changed', event.target.value);
  }

  function handleIsImageChange(event) {
    setIsImage(event.target.value === 'true'); // to maintain boolean value instead of string
  }

  function handleFileChange(event) {
    setErrorMessage('');
    if (event.target.files[0].type.startsWith('image/')) {
      if (event.target.files[0].size > 52428800) {
        setErrorMessage('Image file size limit is 50MB');
        setFile(null);
        return;
      }
    } else if (event.target.files[0].type.startsWith('video/')) {
      if (event.target.files[0].size > 524288000) {
        setErrorMessage('Video file size limit is 500MB');
        setFile(null);
        return;
      }
    } else {
      setErrorMessage('Only image and video files are allowed!');
      setFile(null);
      return;
    }
    setFile(event.target.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setErrorMessage('Missing/incorrect media');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const s3Url = await s3Upload(formData);
      // console.log(s3Url);
      if (!s3Url || s3Url.error) {
        setErrorMessage(s3Url.error);
        return;
      }

      const postData = await createPost({
        title: postTitle,
        content: postContent,
        url: s3Url.message,
        isImage,
        user: username,
        likes: 0,
        likedBy: [],
        comments: [],
        created: new Date().toISOString(),
      });

      if (!postData || postData.error) {
        setErrorMessage(postData.error);
        return;
      }

      setErrorMessage('Post Submitted!');
    } catch (err) {
      const newErrorMessage = err.response?.data?.error ? err.response.data.error : err.message;
      // console.log(errorMessage);
      setErrorMessage(newErrorMessage);
    }
  }

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="sign-text">Create Post</p>
        {errorMessage && <p className="error-text">{errorMessage}</p>}
        <label htmlFor="postTitle">
          Post Title
          <input id="postTitle" type="text" value={postTitle} onChange={handleTitleChange} />
        </label>
        <label htmlFor="postContent">
          Post Content
          <div className="content">
            <textarea id="postContent" type="text" style={{ height: 50, width: 400, left: 0 }} value={postContent} onChange={handleContentChange} />
          </div>
        </label>
        <div>
          File:
          <input
            id="upld"
            data-testid="upld"
            type="file"
            name="someFiles"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </div>

        <label htmlFor="isImageTrue">
          <input type="radio" name="isImage" id="isImageTrue" value required onChange={handleIsImageChange} defaultChecked />
          {' '}
          Image
        </label>
        {' '}
        <br />
        <label htmlFor="isImageFalse">
          <input data-testid="isImageFalse" type="radio" name="isImage" id="isImageFalse" value={false} required onChange={handleIsImageChange} />
          {' '}
          Video
        </label>
        <button type="submit" className="login-button">Submit</button>
      </form>
    </div>
  );
}

export default CreatePost;
