
import React, { Fragment } from "react";
import { useState, useEffect } from 'react';
import "regenerator-runtime/runtime";

import VideoStream from './video'
import Signaling from './signaling';
const signaling = new Signaling()

const VideoPage = () => {

    const initStream = {
        stream: null
    }
    const initRemoteStream = {
        stream: null
    }

    const initState = {
        room_number: '',
        display_video: false,
        peer: null
    }

    const [stream, setStream] = useState(initStream)
    const [remoteStream, setRemoteStream] = useState(initRemoteStream)
    const [state, setState] = useState(initState)

    const createPeer = () => {
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        configuration.sdpSemantics = "plan-b";
        let peer = new RTCPeerConnection(configuration);

        peer.addEventListener('icecandidate', (e) => onIceCandidate(e));
        peer.addEventListener('iceconnectionstatechange', e => onIceStateChange(peer, e));
        peer.addEventListener('track', (e) => gotRemoteStream(e));
        return peer
    }

    const onIceCandidate = (e) => {
        if(e.candidate) {
            signaling.send({type: 'candidate', 'candidate': e.candidate, roomId: 123})
        }
    }

    const onIceStateChange = (peer, e) => {
        console.log(peer.iceConnectionState)
    }

    const showUserMedia = () => {

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then((stream) => setStream(stream))
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect( () => {
        if (stream instanceof MediaStream) {

            const peer = createPeer()
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
            initSignalingEvents(peer)
            signaling.send({type: 'login', roomId: state.room_number, name: 'didoy'})
       
        }
    }, [stream])
    

    useEffect( () => {
        window.addEventListener("beforeunload", onDisconnect);
        return () => window.removeEventListener("beforeunload", onDisconnect);
    }, [])


    const gotRemoteStream = (e) => {
        console.log('gotRemoteStream')
        if (e.streams[0]) {
            setRemoteStream(e.streams[0])
        }
    }

    const onChangeRoom = (e) => {
        const room_number = e.target.value
        setState({ ...state, room_number })
    }

    const joinRoom = () => {
        showUserMedia()
        setState({ ...state, display_video: true })
    }

    const renderRoomInput = () => {
        return (
            <Fragment>
                <input type='text' onChange={(e) => onChangeRoom(e)}/>
                <button onClick={() => joinRoom()}>Enter</button>
            </Fragment>
        )
    }

    return (
        <Fragment>

            <div hidden={state.display_video}>
            {renderRoomInput()}

            </div>

            <div className='video-container' hidden={!state.display_video}>
                <VideoStream
                    stream={stream}
                    remoteStream={remoteStream}
                >
                </VideoStream>
            </div>
        </Fragment>

    );
}

const initSignalingEvents =  (peer) => {
    console.log('initSignalingEvents')

    signaling.on('join', async () => {
        console.log('join')
        const offerOptions = {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 1
          };  
        await createOffer(peer, offerOptions)
    })


    signaling.on('offer', async (message) => {
        console.log('onOfferReceive')
        await onOfferReceive(peer, message)
    })

    signaling.on('candidate', async (message) => {
        if(!peer || !peer?.remoteDescription?.type || null ){
            console.log('not yet set')
        }
        await peer.addIceCandidate(new RTCIceCandidate(message.candidate))
    })

    signaling.on('answer', async (message) => {

        try{
            console.log('on answer receive', message.answer)
            await peer.setRemoteDescription(message.answer)
        }catch(e) {
            console.log(e)
        }
    })

}

const createOffer = async (peer, offerOptions) => {

    try{
        const offer = await peer.createOffer(offerOptions)
        await peer.setLocalDescription(offer)
        signaling.send({type: 'offer', offer: peer.localDescription, roomId: 123})
    }
    catch(e) {
        console.log(e)
    }
}

const onOfferReceive = async (peer, message ) => {

    try{
        await peer.setRemoteDescription(message.offer)
        let answer =  await peer.createAnswer()
        await peer.setLocalDescription(answer)
        signaling.send({type: 'answer', 'answer': peer.localDescription, roomId: 123})
    }
    catch(e) {
        console.log(e)
    }
}

const onDisconnect = () => signaling.send({type: 'close', roomId: 123})

export default VideoPage