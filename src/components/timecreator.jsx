import React, { Component } from 'react';

class TimeCreator extends Component {
    constructor(props){
        super(props);
        this.state={
            devices: []
        }
    }

    addDevice = () => {
        let devices = this.state.devices;
        devices.push({actions:[], pin: undefined, type: undefined});
        this.setState({
            devices
        })
        this.generateLines()

    };

    changeDevicePin = (e, i) => {
        let devices = this.state.devices;
        devices[i].pin= e.target.value;
        this.setState({
            devices
        })
        this.generateLines()

    };

    changeActionDelay = (e, device, action) => {
        let devices = this.state.devices;
        devices[device].actions[action].delay = e.target.value;
        this.setState({
            devices
        })
        this.generateLines()

    };
    changeDeviceType = (e, device) => {
        let devices = this.state.devices;
        devices[device].type = e.target.value;
        this.setState({
            devices
        })
        this.generateLines()

    };

    changeActionDuration = (e, device, action) => {
        let devices = this.state.devices;
        devices[device].actions[action].duration = e.target.value;
        this.setState({
            devices
        })
        this.generateLines()

    };

    addAction = (i) => {
        let devices = this.state.devices;
        devices[i].actions.push({delay: 0, duration: 0});
        this.setState({
            devices
        })
        this.generateLines()
    };

    generateLines = () => {
        let string = 'X\n'
        let checksum = 0;

        this.state.devices.forEach((device)=>{
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
        this.props.lines(string);
    };

    render() {
        return (
            <div className="timecreator">
               <button onClick={this.addDevice}> ADD DEVICE </button>
                <div>
                    {this.state.devices.map((device, i)=>{
                        return(
                                <div key={i}>
                            device {i}
                            type:         <select onChange={(e)=>this.changeDeviceType(e, i)}>
                                    <option value={'F'}>Flash</option>
                                    <option value={'V'}>Valve</option>
                                    <option value={'C'}>Camera</option>
                                    <option value={'B'}>Button</option>
                                </select>
                                {device.actions.map((action, j)=>{
                                        return(
                                            <div key={i+''+j}>
                                                <input type={'text'} value={action.delay} onChange={(e)=>this.changeActionDelay(e, i, j)}/>
                                                <input type={'text'} value={action.duration} onChange={(e)=>this.changeActionDuration(e, i, j)}/>
                                            </div>
                                        )

                                    })}
                                    <button onClick={()=>this.addAction(i)}>ADD ACTION</button>
                                    <input type={'text'} value={device.pin} onChange={(e)=>this.changeDevicePin(e, i)}/>
                                </div>
                            )

                    })}

                    <button onClick={this.generateLines}>generateLines</button>

                </div>
            </div>
        );
    }
}

export default TimeCreator;
