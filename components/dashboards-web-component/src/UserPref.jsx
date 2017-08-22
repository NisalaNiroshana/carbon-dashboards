import React from 'react';

class UserPref extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            userPref: props.userPref,
            width: props.glContainer.width,
            height: props.glContainer.height,
        };
        this.userPref = props.userPref;
        this.chartConfig = this.props.userPref;
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.onChanged = this.onChanged.bind(this);
    }

    componentDidMount() {
        this.drawWidget();
    }

    drawWidget() {
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
            charts: this.userPref ? this.userPref : [{type: 'arc', x: 'Hits', color: 'site', mode: 'pie'}],
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };

        const x = new vizg(data, config);
        x.draw('#' + this.props.id);
    }

    handleResize() {
        this.componentDidMount();
    }

    onChanged(event) {
        if (event.target.value === 'pie') {
            this.userPref = [{type: 'arc', x: 'Hits', color: 'site', mode: 'pie'}];
        } else {
            this.userPref = [{type: 'bar', x: 'site', y: 'Hits'}];
        }
        this.props.saveUserPref(this.state.id, this.userPref);
        this.drawWidget();
    }

    render() {

        return (<section><select onChange={this.onChanged}>
            <option value="pie">Pie - Chart</option>
            <option value="bar">Bar - Chart</option>
        </select>
            <div ref={this.state.id} id={this.state.id}/>
        </section>);
    }
}

export default UserPref;
