//Wowza WebRTC constants
const WEBRTC_CONSTRAINTS = { audio: true, video: false };
const ICE_SERVERS = [{ url: 'stun:numb.viagenie.ca' }, {
    url: 'turn:numb.viagenie.ca',
    username: 'shahzad@fms-tech.com',
    credential: 'P@ssw0rdfms'
}];
//const SERVER_URL = ""; //"wss://localhost.streamlock.net/webrtc-session.json"; set it from the hub connection
const WOWZA_APPLICATION_NAME = "webrtc";
//const WOWZA_STREAM_NAME = ""; //"myStream"; set it from the user name 
const WOWZA_SESSION_ID_EMPTY = "[empty]";

const STATUS_OK = 200;
const STATUS_APPLICATION_FAILURE = 500;
const STATUS_ERROR_STARTING_APPLICATION = 501;
const STATUS_ERROR_STREAM_NOT_RUNNING = 502;
const STATUS_STREAMNAME_INUSE = 503;
const STATUS_STREAM_NOT_READY = 504;
const STATUS_ERROR_CREATE_SDP_OFFER = 505;
const STATUS_ERROR_CREATING_RTP_STREAM = 506;
const STATUS_WEBRTC_SESSION_NOT_FOUND = 507;
const STATUS_ERROR_DECODING_SDP_DATA = 508;
const STATUS_ERROR_SESSIONID_NOT_SPECIFIED = 509;

const CODEC_AUDIO_UNKNOWN = -1;
const CODEC_AUDIO_PCM_BE = 0x00;
const CODEC_AUDIO_PCM_SWF = 0x01;
const CODEC_AUDIO_AC3 = 0x01; //TODO steal this slot
const CODEC_AUDIO_MP3 = 0x02;
const CODEC_AUDIO_PCM_LE = 0x03;
const CODEC_AUDIO_NELLYMOSER_16MONO = 0x04;
const CODEC_AUDIO_NELLYMOSER_8MONO = 0x05;
const CODEC_AUDIO_NELLYMOSER = 0x06;
const CODEC_AUDIO_G711_ALAW = 0x07;
const CODEC_AUDIO_G711_MULAW = 0x08;
const CODEC_AUDIO_RESERVED = 0x09;
const CODEC_AUDIO_VORBIS = 0x09; //TODO steal this slot
const CODEC_AUDIO_AAC = 0x0a;
const CODEC_AUDIO_SPEEX = 0x0b;
const CODEC_AUDIO_OPUS = 0x0c;
const CODEC_AUDIO_MP3_8 = 0x0f;

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
