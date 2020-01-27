import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LogLevel, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { RTCPeerConnection, mediaDevices, RTCIceCandidate, RTCSessionDescription, RTCView } from 'react-native-webrtc';

const widthScreen = Dimensions.get("window").width;
const heightScreen = Dimensions.get("window").height;

const hubUrl = 'http://192.168.1.89:13481/ConnectionHub';
const conn = new HubConnectionBuilder()
  .configureLogging(LogLevel.None)
  .withUrl(hubUrl)
  .build();

var localStream;
var peerConnectionConfig = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
// iceServers: [
//   {
//     urls: 'stun:stun.l.google.com:19302?transport=udp'
//   },
//   {
//     urls: 'stun:numb.viagenie.ca:3478?transport=udp'
//   },
//   {
//     urls: 'turn:numb.viagenie.ca:3478?transport=udp',
//     username: 'shahzad@fms-tech.com',
//     credential: 'P@ssw0rdfms'
//   },
//   {
//     urls: 'turn:turn-testdrive.cloudapp.net:3478?transport=udp',
//     username: 'redmond',
//     credential: 'redmond123'
//   }
// ]
// };
const webrtcConstraints = { audio: true, video: false };

const initializeUserMedia = () => {
  console.log('WebRTC: called initializeUserMedia: ');
  mediaDevices.getUserMedia(webrtcConstraints).then((stream) => {
    console.log("WebRTC: got media stream");
    localStream = stream;
    let audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log(`Using Audio device: ${audioTracks[0].label}`);
    }
  }).catch(err => console.log("Error getting user media stream.", err));
}

export default class App extends Component {
  state = {
    SocketLog: "Not Connected",
    nick: 'RN',
    messages: [],
    inputText: '',
    ConnectionState: 0,
    username: '',
    isUsernameExist: false,
    userStatus: 'idle',
    audioURL: '',
    partnerConnection: undefined
  };

  componentDidMount() {
    conn.start().then(() => this.setState({ ConnectionState: 1, SocketLog: "Connected!" })).catch((err) => {
      console.log(err);
      this.setState({ SocketLog: "Connection Failed!", ConnectionState: 3 });
    });

    conn.on('updateUserList', (userList) => {
      //console.log("updateUserList");
      console.log('userList', userList);
    });

    conn.on('callAccepted', (acceptingUser) => {
      console.log('SignalR: call accepted from: ' + JSON.stringify(acceptingUser) + '.  Initiating WebRTC call and offering my stream up...');
      this.initialOffer(acceptingUser.connectionid, localStream);
      this.setState({ userStatus: 'incall' });
    });

    conn.on('callDeclined', (declingUser, reason) => {
      console.log('SignalR: call declined from: ' + decliningUser.connectionId);
      console.log(reason);
    });

    conn.on('incomingCall', (callingUser) => {
      //console.log("incomingCall");
      //console.log(callingUser);

      console.log('SignalR: incoming call from: ' + JSON.stringify(callingUser));
      Alert.alert(
        callingUser.username + ' is calling.',
        'Do you want to chat?',
        [
          {
            text: 'Cancel', style: 'cancel', onPress: () => {
              conn.invoke('AnswerCall', false, callingUser).catch(err => console.log(err));
            }
          },
          {
            text: 'OK', onPress: () => {
              conn.invoke('AnswerCall', true, callingUser).catch(err => console.log(err));
              this.setState({ userStatus: 'incall' });
            }
          },
        ],
        { cancelable: true }
      )
    });

    conn.on('receiveSignal', (signalingUser, signal) => {
      //console.log("receiveSignal");
      //console.log(signalingUser);
      //console.log(signal);
      this.newSignal(signalingUser.connectionId, signal);
    });

    conn.on('callEnded', (signalingUser, signal) => {
      //console.log("callEnded");
      //console.log(signalingUser);
      //console.log(signal);

      console.log("Call with " + signalingUser.username + " has ended: " + signal);

      console.log("WebRTC: called closeConnection ");
      //console.log("connections: ", connections);
      this.state.partnerConnection.close();
      //this.closeConnection(signalingUser.connectionid);
      //for user to know why call over
      Alert.alert("Call Ended", signal);

      this.setState({ userStatus: 'idle', partnerConnection: undefined });
    });

    conn.onclose((e) => {
      this.setState({ ConnectionState: 0, SocketLog: "Disconnected!" });
      if (e) {
        console.log("Connection closed with error: " + e``);
      } else {
        console.log("Disconnected");
      }
    });
  }

  //TODO
  attachMediaStream = (e) => {
    //console.log(e);
    console.log("OnPage: called attachMediaStream");
    // var partnerAudio = document.querySelector('.audio.partner');
    // if (partnerAudio.srcObject !== e.stream) {
    //     partnerAudio.srcObject = e.stream;
    //     console.log("OnPage: Attached remote stream");
    // }
  }

  //Process a newly received canditate signal
  receivedCandidateSignal = (connection, partnerClientId, candidate) => {
    console.log('WebRTC: adding full candidate');
    connection.addIceCandidate(candidate)
      .then((res) => { console.log('WebRTC: add candidate res', res); console.log("WebRTC: added candidate successfully") })
      .catch((err) => { console.log('WebRTC: add candidate err', err); console.log("WebRTC: cannot add candidate") });
  }
  //process a newly received sdp signal
  receivedSdpSignal = (connection, partnerClientId, sdp) => {
    console.log('WebRTC: processing sdp signal');
    console.log('sdp', sdp);
    connection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
      console.log('WebRTC: set Remote Description');
      if (connection.remoteDescription.type == "offer") {
        console.log('WebRTC: remote Description type offer');
        console.log('localStream', localStream);
        connection.addStream(localStream);
        console.log('WebRTC: added stream');
        connection.createAnswer().then((desc) => {
          console.log('WebRTC: create Answer...');
          console.log('WebRTC: Description...');
          console.log(desc);
          connection.setLocalDescription(desc).then(() => {
            console.log('WebRTC: set Local Description...');
            console.log(connection.localDescription);
            this.sendHubSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
          }).catch(err => console.log("WebRTC: Error while setting local description", err));
        }, err => console.log("WebRTC: Error while creating the answer", err));
      } else if (connection.remoteDescription.type == "answer") {
        console.log('WebRTC: remote Description type answer');
      }
    }).catch(err => console.log("WebRTC: Error while setting remote description", err));
  }

  //Hand off the new signal from the signalR to the connection
  newSignal = (partnerClientId, data) => {
    console.log("WebRTC: receive new signal");
    console.log('datas: ', data);
    var signal = JSON.parse(data);
    var connection = this.getConnection(partnerClientId);
    // console.log("signal: ", signal);
    //console.log("signal: ", signal.sdp || signal.candidate);
    //console.log("partnerClientId: ", partnerClientId);
    console.log("connection", connection);
    //console.log("iceGatheringState", connection.iceGatheringState);
    console.log("signals", signal);
    // Route signal based on type
    if (signal.sdp) {
      console.log('WebRTC: sdp signal');
      this.receivedSdpSignal(connection, partnerClientId, signal.sdp);
    } else if (signal.candidate) {
      console.log('WebRTC: candidate signal');
      this.receivedCandidateSignal(connection, partnerClientId, signal.candidate);
    } else {
      console.log('WebRTC: adding null candidate');
      //connection.addIceCandidate(null, () => console.log("WebRTC: added null candidate successfully"), () => console.log("WebRTC: cannot add null candidate"));
    }
  }

  onStreamRemoved = (connection, streamId) => {
    console.log("WebRTC: Stream Removed");
    //console.log("Stream: ", streamId);
    //console.log("connection: ", connection);
  }

  closeConnection = (partnerClientId) => {
    console.log("WebRTC: called closeConnection ");
    //console.log("connections: ", connections);
    this.state.partnerConnection.close();
    this.setState({ partnerConnection: '' });
    var connection = connections[partnerClientId];

    if (connection) {
      // Let the user know which streams are leaving
      // todo: foreach connection.remoteStreams -> onStreamRemoved(stream.id)
      this.onStreamRemoved(null, null);

      // Close the connection
      connection.close();
      delete connections[partnerClientId]; // Remove the property
    }
  }

  // Close all of our connections
  closeAllConnections = () => {
    console.log("WebRTC: call closeAllConnections ");
    for (var connectionId in connections) {
      this.closeConnection(connectionId);
    }
  }

  sendHubSignal = (data, partnerClientId) => {
    console.log('SignalR: called sendhubsignal ');
    conn.invoke('sendSignal', data, partnerClientId).catch(err => console.log('WebRTC: Error sending signal', err));
  }

  callbackRemoveStream = (connection, evt) => {
    console.log('WebRTC: removing remote stream from partner window');
    // Clear out the partner window
    //var otherAudio = document.querySelector('.audio.partner'); //TODO
    //otherAudio.src = '';
  }

  callbackAddStream = (connection, evt) => {
    console.log('WebRTC: called callbackAddStream');

    // Bind the remote stream to the partner window
    //var otherVideo = document.querySelector('.video.partner');
    //attachMediaStream(otherVideo, evt.stream); // from adapter.js
    this.attachMediaStream(evt);
  }

  callbackIceCandidate = (evt, partnerClientId, connection) => {
    console.log("WebRTC: Ice Candidate callback");
    console.log("connection ", connection);
    //console.log("iceConnectionState: ", evt.currentTarget.iceConnectionState);
    //console.log("iceGatheringState: ", evt.currentTarget.iceGatheringState);
    if (evt.candidate) {// Found a new candidate
      console.log('WebRTC: new ICE candidate');
      //console.log("evt.candidate: ", evt.candidate);
      this.sendHubSignal(JSON.stringify({ "candidate": evt.candidate }), partnerClientId);
    } else {
      // Null candidate means we are done collecting candidates.
      console.log('WebRTC: ICE candidate gathering complete');
      this.sendHubSignal(JSON.stringify({ "candidate": null }), partnerClientId);
    }
  }

  initializeConnection = (partnerClientId) => {
    console.log('WebRTC: Initializing connection...');
    //console.log("Received Param for connection: ", partnerClientId);

    var connection = new RTCPeerConnection(peerConnectionConfig);
    console.log("peer connection: ", connection);
    connection.onicecandidateerror = evt => console.log("WebRTC: Error on ice candidate", evt);
    //connection.onIceGatheringChangeCOMPLETE = evt => console.log("WebRTC: ice gathering change complete", evt);
    //connection.iceConnectionState = evt => console.log("WebRTC: iceConnectionState", evt); //not triggering on edge
    //connection.iceGatheringState = evt => console.log("WebRTC: iceGatheringState", evt); //not triggering on edge
    //connection.ondatachannel = evt => console.log("WebRTC: ondatachannel", evt); //not triggering on edge
    //connection.oniceconnectionstatechange = evt => console.log("WebRTC: oniceconnectionstatechange", evt); //triggering on state change 
    //connection.onicegatheringstatechange = evt => console.log("WebRTC: onicegatheringstatechange", evt); //triggering on state change 
    //connection.onsignalingstatechange = evt => console.log("WebRTC: onsignalingstatechange", evt); //triggering on state change 
    //connection.ontrack = evt => console.log("WebRTC: ontrack", evt);
    connection.onicecandidate = evt => this.callbackIceCandidate(evt, partnerClientId, connection); // ICE Candidate Callback
    //connection.onnegotiationneeded = evt => callbackNegotiationNeeded(connection, evt); // Negotiation Needed Callback
    connection.onaddstream = evt => this.callbackAddStream(connection, evt); // Add stream handler callback
    connection.onremovestream = evt => this.callbackRemoveStream(connection, evt); // Remove stream handler callback
    this.setState({ partnerConnection: connection });
    //connections[partnerClientId] = connection; // Store away the connection
    //console.log(connection);
    return connection;
  }

  getConnection = (partnerClientId) => {
    console.log("WebRTC: called getConnection");
    if (this.state.partnerConnection) {
      console.log("WebRTC: connections partner client exist");
      return this.state.partnerConnection;
    }
    else {
      console.log("WebRTC: initialize new connection");
      return this.initializeConnection(partnerClientId)
    }
  }

  initialOffer = (partnerClientId, stream) => {
    console.log('WebRTC: called initiateoffer: ');
    var connection = this.getConnection(partnerClientId); // // get a connection for the given partner
    //console.log('initiate Offer stream: ', stream);
    //console.log("offer connection: ", connection);
    connection.addStream(stream);// add our audio/video stream
    console.log("WebRTC: Added local stream");

    connection.createOffer().then(offer => {
      console.log('WebRTC: created Offer: ');
      console.log('WebRTC: Description after offer: ', offer);

      connection.setLocalDescription(offer).then(() => {
        console.log('WebRTC: set Local Description: ');
        console.log('connection before sending offer ', connection.localDescription);
        this.sendHubSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
      }).catch(err => console.error('WebRTC: Error while setting local description', err));
    }).catch(err => console.error('WebRTC: Error while creating offer', err));
  }

  sendRequest = () => {
    conn.invoke('Send', this.state.inputText);
    this.textInput.clear();
  }

  setUsername = () => {
    //console.log("Username is set.");
    conn.invoke("Join", this.state.username).catch(err => console.log(err));
    this.setState({ isUsernameExist: true });
    initializeUserMedia();
  }

  renderItem() {
    return this.state.messages.map((item, key) => {
      return (
        <View key={key}><Text>{item}</Text></View>
      )
    })
  }

  render() {
    let { isUsernameExist, username, SocketLog, ConnectionState, audioURL, userStatus } = this.state;
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: widthScreen, height: 100 }}>
          <Text style={{ fontSize: 20, color: 'green' }}>Status: {userStatus}</Text>
          {isUsernameExist && (<Text style={{ fontSize: 20, color: 'red' }}>You are {username}</Text>)}
          <Text style={{ fontSize: 20, color: 'blue' }}>{SocketLog}</Text>
        </View>
        {ConnectionState === 1 ? (
          <View style={{ flex: 1, }}>
            <RTCView style={{ flex: 1 }} streamURL={audioURL} />
            {isUsernameExist ? (
              <View>
                <ScrollView>
                  {this.state.messages !== 0 && (this.renderItem())}
                </ScrollView>
                <View style={{
                  flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 10, width: widthScreen,
                  height: 40
                }}>
                  <TextInput ref={input => { this.textInput = input }}
                    defaultValue=''
                    underlineColorAndroid='#F5FCFF'
                    style={{ padding: 5, fontSize: 20, width: widthScreen - 50, borderColor: 'lightgray', borderWidth: 1, borderRadius: 50 }}
                    onChangeText={(text) => this.setState({ inputText: text })}
                    placeholder="Enter your message">
                  </TextInput>
                  <TouchableOpacity style={{ width: 50, }} onPress={this.sendRequest}>
                    <Text style={{ padding: 7, backgroundColor: 'lightgray' }}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
                <View style={{
                  flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 10, width: widthScreen,
                  height: 40
                }}>
                  <TextInput ref={input => { this.textInput = input }}
                    defaultValue=''
                    underlineColorAndroid='#F5FCFF'
                    style={{ padding: 5, fontSize: 20, width: widthScreen - 50, borderColor: 'lightgray', borderWidth: 1, borderRadius: 50 }}
                    onChangeText={(username) => this.setState({ username })}
                    placeholder="Enter your Username">
                  </TextInput>
                  <TouchableOpacity style={{ width: 50, }} onPress={this.setUsername}>
                    <Text style={{ padding: 7, backgroundColor: 'lightgray' }}>Set</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        ) : (
            <ActivityIndicator color='darkblue' />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});
