import React, { Component } from 'react';
import './App.css';
import TimeCreator from './components/timecreator'

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      ports: [],
      selected  : '',
      connected: undefined,
      linesReceived: '',
        string : '',
        rounds: 0
    }
  }
  componentDidMount() {
    chrome.serial.getDevices((ports)=> {
      this.setState({
        ports
      })
    });

    chrome.serial.onReceive.addListener(this.onReceive);
    chrome.serial.onReceiveError.addListener(this.onError);


  }

  onError = (info) =>{
    console.log(info)
  }

  onReceive = (info) =>{
    console.log(this.ab2str(info.data) );
    const newLines = this.state.linesReceived +"\n"+ this.ab2str(info.data);
    this.setState({
      linesReceived: newLines
    })
  };

  deleteText = (info) =>{
    this.setState({
      linesReceived: ""
    })
  };

  onChange = (e) =>{
    this.setState({
      selected: e.target.value
    })
  };

  onChangeText = (e) =>{
    this.setState({
      text: e.target.value
    })
  };

   str2ab =(str) => {
    const buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
     const bufView = new Uint8Array(buf);
    for (let i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  };

   ab2str = (buf) => {
     return String.fromCharCode.apply(null, new Uint8Array(buf));
   }

  send=(string)=>{
    chrome.serial.send(this.state.connected, this.str2ab(string+"\n"), (sendInfo)=>{
      console.log(sendInfo)
    })
  }

   connect=()=> {
     if(this.state.connected) {
       chrome.serial.disconnect(this.state.connected, (info) => {
         console.log('Connection id: ' + this.state.connected + ' closed');
         this.setState({
           connected: info.connectionId
         });
       });
     }else{
       chrome.serial.connect(this.state.selected, {bitrate: 9600},  (info) => {
         this.setState({
           connected: info.connectionId
         });
         console.log('Connection opened with id: ' + info.connectionId + ', Bitrate: ' + info.bitrate);
       });
     }

   };

   lines= (e)=>{
       console.log(e);
this.setState({
    string: e
})};

   run = () => {
       let string = this.state.string + 'R;'+this.state.rounds+'^'+this.state.rounds;

       console.log(string);
       this.send(string);
   };

   changeRounds =(e)=>{
       this.setState({
           rounds : e.target.value
       })
   };

  render() {
    return (
      <div className="App">
        <select onChange={this.onChange}>
          {this.state.ports.map((port)=>{
            return(
              <option selected={this.state.selected === port.path} value={port.path}>{port.path}</option>
            )
          })}
        </select>
        <button onClick={this.connect}>{!!this.state.connected ? 'Deconectar' : 'Conectar'}</button>
        <textarea onChange={this.onChangeText} value={this.state.text}>

        </textarea>
        <button onClick={this.send} disabled={!this.state.connected}> Send </button>

        <div>
                <span>
                  {this.state.linesReceived}<br/>
                </span>
        </div>
          <button onClick={this.deleteText} > Delete text </button>
          <button onClick={this.deleteText} > Delete text </button>
            <TimeCreator lines={this.lines}/>
            <input type={'text'} onChange={this.changeRounds}/>
          <button onClick={this.run} > run </button>

      </div>
    );
  }
}

export default App;
