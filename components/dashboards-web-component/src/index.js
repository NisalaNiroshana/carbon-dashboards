import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-light-theme.css';
import BarChart from './BarChart';
import PieChart from './PieChart';
import Publisher from './Publisher';
import Subscriber from './Subscriber';
import DynamicWidget from './DynamicWidget';
import EmptyWidget from './EmptyWidget';
import UserPref from './UserPref';
import '../public/css/dashboard.css';
import SimpleLineChart from './ReChart';

let uuid;
const config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: true,
        showMaximiseIcon: true,
        responsive: true,
        responsiveMode: 'always',
        showCloseIcon: true,
    },
    dimensions: {
        minItemWidth: 400,
    },
    content: [],
};


const widgetsList = [
    {
        title: 'Bar - Chart',
        component: 'barChart',
        id: 'barchart',
    },
    {
        title: 'Pie - Chart',
        component: 'pieChart',
        id: 'pieChart',
    },
    {
        title: 'Publisher',
        component: 'publisher',
        id: 'publisher',
    },
    {
        title: 'Subscriber',
        component: 'subscriber',
        id: 'subscriber',
    },
    {
        title: 'DynamicWidget',
        component: 'DynamicWidget',
        id: 'dynamicWidget',
    },
    {
        title: 'EmptyWidget',
        component: 'EmptyWidget',
        id: 'emptyWidget',
    },
    {
        title: 'UserPref',
        component: 'UserPref',
        id: 'userPref'
    },
    {
        title: 'SimpleLineChart',
        component: 'SimpleLineChart',
        id: 'SimpleLineChart'
    }
];

let myLayout = new GoldenLayout(config, document.getElementById('view'));
function initializeWidgetList() {
    for (const widget in widgetsList) {
        addWidget(widgetsList[widget]);
    }
}
initializeWidgetList();
myLayout.registerComponent('barChart', BarChart);
myLayout.registerComponent('pieChart', PieChart);
myLayout.registerComponent('publisher', Publisher);
myLayout.registerComponent('subscriber', Subscriber);
myLayout.registerComponent('DynamicWidget', DynamicWidget);
myLayout.registerComponent('EmptyWidget', EmptyWidget);
myLayout.registerComponent('UserPref', UserPref);
myLayout.registerComponent('SimpleLineChart', SimpleLineChart);


function addWidget(widget) {
    const menuContainer = document.getElementById('menuContainer');
    const menuItem = document.createElement('div');
    menuItem.innerHTML = '<li id=\"' + widget.id + '\">' + widget.title + '</li>';
    menuContainer.appendChild(menuItem.firstChild);

    const id = getGadgetUUID(widget.component);
    const newItemConfig = {
        title: widget.title,
        type: 'react-component',
        widget: 'true',
        component: widget.component,
        id: id,
        userPref: "",
        props: {id: id, saveUserPref: saveUserPref},
        header: {
            show: true,
        },

    };
    myLayout.createDragSource(document.getElementById(widget.id), newItemConfig);
}

function getGadgetUUID(widgetName) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return widgetName + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

var saveUserPref = function (widgetID, userPref) {
    let contentElements = myLayout.root;
    let contents = myLayout._getAllContentItems();
    for (let content of contents) {
        if (content.hasId(widgetID)) {
            contentElements.getItemsById(widgetID)[0].config.props.userPref = userPref;
            //contentElements.getItemsById(widgetID)[0].config.props.nnn = "jhjhjh";
            // contentElements.getItemsById(widgetID)[0].config.props.saveUserPref = JSON.stringify(this.saveUserPref, function (key, value) {
            //     if (typeof value === 'function') {
            //         return value.toString();
            //     }
            //     return value;
            // });
        }
    }
    var state = JSON.stringify(myLayout.toConfig());
    localStorage.setItem('savedState', state);
}


function renderDashboard() {
    //  myLayout.destroy();

    console.log("Re-rendered the Dashboard");
//     var j = JSON.parse(localStorage.getItem('savedState'), function (key, value) {
//         console.log("PPPPPPPPPPnjnjnjjnjPPPP"+value+"          "+typeof value+"           ")
//         if(typeof value == "string"){
//             console.log("DDDDDDDDD      "+value.substr(1, 9).match("function") )
//         }
//         if (value
//             && typeof value === "string"
//             && value.substr(1, 9).includes("function") ){
//             var startBody = value.indexOf('{') + 1;
//             var endBody = value.lastIndexOf('}');
//             var startArgs = value.indexOf('(') + 1;
//             var endArgs = value.indexOf(')');
// console.log("PPPPPPPPPPPPPP")
//             return new Function(value.substring(startArgs, endArgs).split(",")[0],value.substring(startArgs, endArgs).split(",")[1].trim()
//                 , value.substring(startBody, endBody));
//         }
//         return value;
//     });
    var json = myLayout.toConfig();
    console.log("Nisala");
    var widgets = [] ;
    console.log(findWidget(json.content,widgets));
    console.log("NisalaNana");
    console.log(JSON.stringify(myLayout.toConfig()));
    // myLayout = new GoldenLayout(JSON.parse(localStorage.getItem('savedState')), document.getElementById('view'));
    // myLayout.registerComponent('barChart', BarChart);
    // myLayout.registerComponent('pieChart', PieChart);
    // myLayout.registerComponent('publisher', Publisher);
    // myLayout.registerComponent('subscriber', Subscriber);
    // myLayout.registerComponent('DynamicWidget', DynamicWidget);
    // myLayout.registerComponent('EmptyWidget', EmptyWidget);
    // myLayout.registerComponent('UserPref', UserPref);
    // myLayout.init();
    // let contentElements = myLayout.root;
    // for(let item of contentElements.getItemsByType('component')){
    //     item.config.props.saveUserPref = this.saveUserPref;
    // }
    // myLayout.init();
}

function findWidget(json,widgets) {
    json.forEach(ele => {
        if (!(ele.type == 'component')) {
            findWidget(ele.content,widgets)
        } else {
            widgets.push(ele);
        }
    });
    return widgets;

}
document.getElementById("userPrefBtn").onclick = renderDashboard;

myLayout.init();

myLayout.on('stateChanged', function () {
    document.getElementById("menuContainer").innerHTML = "";
    initializeWidgetList();
});

window.onresize = function () {
    myLayout.updateSize();
};

