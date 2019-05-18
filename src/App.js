import React, { Component } from 'react';
import './App.css';
import TimeCreator from './components/timecreator'
import fdialogs from 'node-webkit-fdialogs';
class App extends Component {
  constructor(props){
    super(props);


      this.textLog = React.createRef();


    this.state={
      ports: [],
      connected: undefined,
      linesReceived: '',
        string : '',
        sending: false,
        running: false,
        rounds: 1,
        roundDelay: 0,
        struc: []
    }

      if(!!localStorage.getItem('selectedPort')){
          this.state.selected = localStorage.getItem('selectedPort')
      }

  }
  componentDidMount() {
    this.updateDevices();

    this.connect();

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
          label: 'File',
          submenu: submenu
      }));

// Assign it to `window.menu` to get the menu displayed
      nw.Window.get().menu = menu;


  }

  updateDevices =()=>{
      chrome.serial.getDevices((ports)=> {
          let exists = false;
          let portArray = [];

          ports.forEach((port, i)=>{
                  portArray.push(port);

          });

          console.log(portArray);

          this.setState({
              ports: portArray
          })
      });
};


  onError = (info) =>{
    console.log(info)
  }

  onReceive = (info) =>{


    if(this.ab2str(info.data).indexOf("Finished") !== -1){
        this.setState({
            running: false
        })
    }

    let st = this.ab2str(info.data).replace(/(\r\n|\n|\r)/gm, "");


      let newLines = this.state.linesReceived +"\n"+ st;

      this.setState({
      linesReceived: newLines
    }, ()=>{
            if(this.textLog.current){
                this.textLog.current.scrollTop = this.textLog.current.scrollHeight;
            }
    })
  };

  deleteText = (info) =>{
    this.setState({
      linesReceived: ""
    })
  };

  onChange = (e) =>{
     let value = e.target.value;
    this.setState({
      selected: value
    }, ()=>{
        localStorage.setItem('selectedPort', value)
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


   cancel = () =>{
       this.send('C\n');
       this.setState({
           running: false
       })

   }

  send=(string)=>{

       this.setState({
           sending: true
       })
       let lines = string.split("\n");
       lines.forEach((line)=>{
           this.sleep(100);
               chrome.serial.send(this.state.connected, this.str2ab("\n"+line+"\n"), (sendInfo)=>{
    })
  })
      this.setState({
          sending: false
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
     }else {
         let exists = false
         this.state.ports.forEach((port)=>{
             if(port.path === this.state.selected){
                 exists = true;
             }
         });

         if (exists) {
             chrome.serial.connect(this.state.selected, {bitrate: 9600}, (info) => {
                 this.setState({
                     connected: info.connectionId
                 });
                 console.log('Connection opened with id: ' + info.connectionId + ', Bitrate: ' + info.bitrate);
             });
         }
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
    sleep = (milliseconds)=> {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }
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

   sendToDevice = () => {
       let string = this.generateLines() +'\n';

       this.send(string);
   };

   run = ()=>{

       this.setState({
           running: true
       });

       let string =  '\nR;'+this.state.rounds+';'+this.state.roundDelay+'^'+(parseInt(this.state.rounds, 10)+parseInt(this.state.roundDelay, 10))+'\n';
       this.send(string);

   }

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

                  <select   defaultValue={this.state.selected}  onChange={this.onChange}>
                      {this.state.ports.map((port, i)=>{
                        return(
                          <option key={i} value={port.path}>{port.displayName}{'-'}{port.path}</option>
                        )
                      })}
                  </select>
                  <button onClick={this.updateDevices}>Actualizar</button>
                  <button onClick={this.connect}>{!!this.state.connected ? 'Desconectar' : 'Conectar'}</button>
</div>

            <div className={'timeContainer'}>

                    <TimeCreator struc={this.state.struc} json={this.json}
                                 lines={this.lines}/>

            </div>
            <div className={'footerContainer '}>

                <div style={{textAlign:'right'}}>
                    <button  disabled={this.state.sending} onClick={this.sendToDevice} > Enviar </button>
                    <label>Rondas</label>
                    <input  value={this.state.rounds} type={'number'} onChange={this.changeRounds}/>
                    <label>Delay</label>
                    <input  value={this.state.roundsDelay}  type={'number'} onChange={this.changeRoundDelay}/>
                    <button  disabled={this.state.sending}  onClick={this.run} > Ejecutar </button>
                    {/*this.state.running &&
                    < button className={'btn btn-danger col-4'} disabled={this.state.sending} onClick={this.cancel} > Cancelar </button>
                    */}</div>

            </div>
      </div>
    );
  }
}

export default App;
