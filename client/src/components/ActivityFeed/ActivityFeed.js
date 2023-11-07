import '../PostList.css'
import './ActivityFeed.css'
import PostList from '../PostList';
import React from 'react';
import { useEffect, useState } from 'react';
import { getAllPosts } from '../../api/posts';

const ActivityFeed = (props) => {

    //should be passed in posts as props? I dont think so? 
    const currentUser = props.currentUser;
    const [posts, setPosts] = useState(null);

    let list = currentUser?.following;
    if (list !== undefined){
        if (!list.includes(currentUser.username)){
            list.push(currentUser.username);
        }
    }
    
    useEffect(() => {
        async function getPostWrapper(){
            const data = await getAllPosts();
            setPosts(data);
            return data;
        }
        getPostWrapper();
    },[]);

    return (  
        <div className = "feed" id="feedComponent">
            <h2> Activity Feed </h2>
            {/* {console.log("current user: " + currentUser.username)} */}
            {posts && <PostList posts = {posts} userList = {list} currentUser={props.currentUser}/>}
        </div>

    );
}

 
export default ActivityFeed;
