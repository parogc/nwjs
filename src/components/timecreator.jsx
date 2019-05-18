import React, { Component } from 'react';
import './style.css'
class TimeCreator extends Component {
    constructor(props){
        super(props);
        this.state={
            devices: []
        }
    }


    componentWillReceiveProps(nextProps){

        if(!!nextProps.struc){

            this.setState({
                devices: nextProps.struc
            })
        }


    }
    addDevice = () => {
        let devices = this.state.devices;
        devices.push({actions:[], pin: undefined, type: 'C'});
        this.setState({
            devices
        })

    };
    removeDevice = (i) => {
        let devices = this.state.devices;
        devices.splice(i, 1);
        this.setState({
            devices
        });

    };

    changeDevicePin = (e, i) => {
        let devices = this.state.devices;
        devices[i].pin= e.target.value;
        this.setState({
            devices
        })

    };

    changeActionDelay = (e, device, action) => {
        let devices = this.state.devices;
        devices[device].actions[action].delay = e.target.value;
        this.setState({
            devices
        })

    };
    changeDeviceType = (e, device) => {
        let devices = this.state.devices;
        devices[device].type = e.target.value;
        this.setState({
            devices
        })

    };

    changeActionDuration = (e, device, action) => {
        let devices = this.state.devices;
        devices[device].actions[action].duration = e.target.value;
        this.setState({
            devices
        })

    };

    removeAction = (device, action) => {
        let devices = this.state.devices;
        devices[device].actions.splice(action, 1);
        this.setState({
            devices
        });

    };

    addAction = (i) => {
        let devices = this.state.devices;
        devices[i].actions.push({delay: 0, duration: 0});
        this.setState({
            devices
        })

    };

    

    render() {
        return (
            <div className="timecreator">
                <div id={'row'}>
                    {this.state.devices.map((device, i)=>{
                        return(
                            <div className={'items'} key={i}>
                                  <div className={'deviceForm'}>
                                      device {i} {' '}type:{' '}
                                   <select defaultValue={device.type} onChange={(e)=>this.changeDeviceType(e, i)}>
                                        <option value={'F'}>Flash</option>
                                        <option value={'V'}>Valve</option>
                                        <option value={'C'}>Camera</option>
                                        <option value={'B'}>Button</option>
                                   </select></div>

                                        {device.actions.map((action, j)=>{
                                            return(
                                                    <div className={'actionLine'}  key={i+''+j}>
                                                        <input className={'deviceInput'} type={'number'} placeholder={'Delay'} value={action.delay} onChange={(e)=>this.changeActionDelay(e, i, j)}/>
                                                        <input className={'deviceInput'} type={'number'} placeholder={'Duration'}  value={action.duration} onChange={(e)=>this.changeActionDuration(e, i, j)}/>
                                                        <span className={'removeAction'} onClick={()=>this.removeAction(i, j)}>X</span>
                                                    </div>
                                            )

                                        })}

                                        <div className={'deviceButtons'}>
                                            <div style={{textAlign: 'center'}}>
                                                <button onClick={()=>this.addAction(i)}>ADD ACTION</button>
                                                <button onClick={()=>this.removeDevice(i)}> REMOVE DEVICE </button>
                                                <input style={{textAlign: 'center'}} type={'text'} className={'devicePin withBorder'} placeholder={'Pin number'}  value={device.pin} onChange={(e)=>this.changeDevicePin(e, i)}/>
                                            </div>
                                        </div>
                            </div>
                        )
                    })}
                    <div>
                        {/*<button  onClick={this.generateLines}>generateLines</button>*/}
                    </div>
                </div>
                <button onClick={this.addDevice}> ADD DEVICE </button>
            </div>
        );
    }
}

export default TimeCreator;
