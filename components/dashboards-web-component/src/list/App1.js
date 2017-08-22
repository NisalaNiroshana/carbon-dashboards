import React from 'react';
import './App1.css';

class App1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id
        };
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        const data = [
            {
                metadata: {
                    names: ['Hits', 'site'],
                    types: ['linear', 'ordinal'],
                },
                data: [
                    [103025, 'Facebook'],
                    [98253, 'Google'],
                    [10124, 'Yahoo'],
                    [68598, 'Youtube'],
                ],
            },
        ];

        const config = {
            charts: [{ type: 'arc', x: 'Hits', color: 'site', mode: 'pie' }],
            width: 1000,
            height: 500,
        };

        const x = new vizg(data, config);
        x.draw('#te2');
    }

    handleResize() {
        this.componentDidMount();
    }

    render() {
        return <section><div className="test">wso2</div><div id="te2" /></section>;
    }
}

function test2() {
    return <App1/>;
}
global.test2 = test2;