import React, { Component } from 'react';
import './App.css';
import TimeCreator from './components/timecreator'
import fdialogs from 'node-webkit-fdialogs';
class App extends Component {
  constructor(props){
    super(props);


    this.state={
      ports: [],
      selected  : '',
      connected: undefined,
      linesReceived: '',
        string : '',
        rounds: 1,
        roundDelay: 0,
        struc: []
    }
  }
  componentDidMount() {
    this.updateDevices();

    chrome.serial.onReceive.addListener(this.onReceive);
    chrome.serial.onReceiveError.addListener(this.onError);


      var menu = new nw.Menu({type: 'menubar'});

// Create a submenu as the 2nd level menu
      var submenu = new nw.Menu();

      submenu.append(new nw.MenuItem({
          label: 'Guardar' ,
          click: ()=> {
              this.save()
          },
          key: "s",
          modifiers: "ctrl+s"}));
      submenu.append(new nw.MenuItem({ label: 'Cargar', click: ()=> {
              this.load()
          },
          key: "l",
          modifiers: "ctrl+l" }));

// Create and append the 1st level menu to the menubar
      menu.append(new nw.MenuItem({
          label: 'First Menu',
          submenu: submenu
      }));

// Assign it to `window.menu` to get the menu displayed
      nw.Window.get().menu = menu;


  }

  updateDevices =()=>{
      chrome.serial.getDevices((ports)=> {
          this.setState({
              ports
          })
      });
};

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

    generateLines = () => {
        let string = 'X\n';

        this.state.struc.forEach((device)=>{
            let checksum = 0;

            let command = 'S';
            let type = device.type;
            let pin = device.pin;

            let actionString = '';
            device.actions.forEach((action)=>{
                let delay = action.delay;
                let duration = action.duration;

                actionString += ';'+delay+'|'+duration;
                checksum = parseInt(checksum)+parseInt(delay)+parseInt(duration);
            });

            string += command + ';'+ pin +';'+ type + actionString + '^'+checksum+'\n';
        });


        return(string);
    };

   lines= (e)=>{
       console.log(e);
this.setState({
    string: e
})};
    json= (e)=>{
        console.log(e);
        this.setState({
            structure: e
        })};

   run = () => {
       let string = this.generateLines() + 'R;'+this.state.rounds+';'+this.state.roundDelay+'^'+(parseInt(this.state.rounds, 10)+parseInt(this.state.roundDelay, 10));

       this.send(string);
   };

   changeRounds =(e)=>{
       this.setState({
           rounds : e.target.value
       })
   };
    changeRoundDelay =(e)=>{
       this.setState({
           roundDelay : e.target.value
       })
   };

    load = () => {

        fdialogs.readFile( (err, data, path)=> {
            this.setState({
                struc: JSON.parse(data)
            })
        })
    };

    save = () => {
        let content = new Buffer(JSON.stringify(this.state.struc), 'utf-8');
        fdialogs.saveFile(content, function (err, path) {

        });
    };

  render() {
    return (
      <div className="App">
          <div className={'topContainer'}>
              <div className={'row'}>
                  <div className={'col-4'} >
                  <select className={'selectDevice col-12'} onChange={this.onChange}>
                      {this.state.ports.map((port)=>{
                        return(
                          <option selected={this.state.selected === port.path} value={port.path}>{port.path}</option>
                        )
                      })}
                  </select></div>
                  <div className={'col-3'} >
                  <button className={'btn btn-primary'} onClick={this.updateDevices}>Actualizar</button>
                  <button className={!!this.state.connected ? 'btn btn-danger' : 'btn btn-primary'} onClick={this.connect}>{!!this.state.connected ? 'Desconectar' : 'Conectar'}</button>
              </div></div>
</div>

           <button className={'btn btn-primary'} onClick={this.deleteText} > Delete text </button>
            <div className={'timeContainer'}>

                    <TimeCreator struc={this.state.struc} json={this.json}
                                 lines={this.lines}/>

            </div>
            <div className={'footerContainer row'}>
                <div className={'col-6'}>
                    <textarea disabled={true} style={{width: '100%', height: '100%'}}>
                      {this.state.linesReceived}
                    </textarea>
                </div>
                <div className={'col-6'}>
                    <label>Rondas</label>
                    <input className="form-control col-4 offset-4" value={this.state.rounds} type={'text'} onChange={this.changeRounds}/>
                    <label>Delay</label>
                    <input className="form-control col-4 offset-4" value={this.state.roundsDelay}  type={'text'} onChange={this.changeRoundDelay}/>
                    <button className={'btn btn-primary col-4'}  onClick={this.run} > Ejecutar </button>
                </div>

            </div>
      </div>
    );
  }
}

export default App;
