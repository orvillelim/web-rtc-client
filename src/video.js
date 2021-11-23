import { useRef, useEffect } from 'react';
import React from "react";
import {Fragment} from "react";


const VideoStream = (props) => {
    let videoRef = useRef();
    let videoRefRemote = useRef();

    useEffect( () => {
 
        if(props.stream instanceof MediaStream) {
            videoRef.current.srcObject = props.stream
        }

    },  [props.stream]);

    useEffect( () => {
 
        if(props.remoteStream instanceof MediaStream) {
            console.log('remoteStream', props.remoteStream)
            videoRefRemote.current.srcObject = props.remoteStream
        }

    },  [props.remoteStream]);



    return (
        <Fragment>
            <Fragment>
                <video autoPlay className={'local'} ref={videoRef}>
                </video>
                <p>local</p>
            </Fragment>

            <Fragment>
                <video autoPlay className={'remote'} ref={videoRefRemote}>
                </video>
                <p>remote</p>
            </Fragment>
        </Fragment>


    );
}

export default VideoStream