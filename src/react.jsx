class Clock extends React.Component{
    constructor(props){
        super(props);
        this.state = {date: new Date()};
    }
    render(){
        return (
        <div>
            <h5 style={{color: "white"}}>{this.state.date.toLocaleTimeString()}</h5>
        </div>
        );
    }

    componentDidMount(){
        setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount(){
        alert("Unmount");
    }

    tick() {
        this.setState({date: new Date()});
    }
}

ReactDOM.render(<Clock />, document.getElementById("clock"));