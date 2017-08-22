import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-dark-theme.css';
import '../public/css/dashboard.css';
import axios from 'axios';
import ReactDOM from 'react-dom';
import ViewComponent from './viewComponent';

// const config = {
//     settings: {
//         hasHeaders: false,
//         constrainDragToContainer: false,
//         reorderEnabled: false,
//         selectionEnabled: false,
//         popoutWholeStack: false,
//         blockedPopoutsThrowError: true,
//         closePopoutsOnUnload: true,
//         showPopoutIcon: false,
//         showMaximiseIcon: false,
//         responsive: true,
//         isClosable:false,
//         responsiveMode: 'always',
//         showCloseIcon: false,
//     },
//     dimensions: {
//         minItemWidth: 400,
//     },
//     isClosable: false,
//     content: []
// };
//
// let myLayout = new GoldenLayout(config, document.getElementById('view'));
// var widgetCount = 0;
// function renderDashboard() {
//     let widgetList = new Set();
//     let instance = axios.create({
//         baseURL: 'http://localhost:8082/app/public',
//         timeout: 2000
//     });
//
//     instance.get('/sampleDashboard.json').then(function (response) {
//         console.log(findWidget(response.data.content, widgetList));
//         widgetCount = widgetList.size;
//         myLayout.destroy();
//         config.content = response.data.content;
//         myLayout = new GoldenLayout(config, document.getElementById('view'));
//         widgetList.forEach(widget => {
//             widgetList.add(widget);
//             loadWidget(widget)
//         });
//     }).catch(function (error) {
//         console.log(error)
//     });
// }
// var widgets = new Map();
// var registeredWidgets = 0;
//
//
// function registerWidget(widgetId, widgetObj) {
//     if (!widgets.get(widgetId)) {
//         widgets.set(widgetId, widgetObj);
//         myLayout.registerComponent(widgetId, widgets.get(widgetId));
//         registeredWidgets++;
//         if (registeredWidgets == widgetCount) {
//             renderD();
//         }
//     }
// }
//
//
// global.dashboard = {};
// global.dashboard.registerWidget = registerWidget;
//
// function renderD() {
//     myLayout.init();
// }
//
// function loadWidget(widgetID) {
//     var head = document.getElementsByTagName('head')[0];
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = "http://localhost:8082/app/public/" + widgetID + ".js";
//     head.appendChild(script);
// }
//
// function findWidget(json, widgets) {
//     json.forEach(ele => {
//         if (!(ele.type == 'component')) {
//             ele.title = "";
//             findWidget(ele.content, widgets)
//
//         } else {
//             ele.header = {"show": true};
//             ele.isClosable = false;
//             ele.componentName = "lm-react-component";
//             widgets.add(ele.component);
//         }
//     });
//     return widgets;
// }
//
// renderDashboard();
//
//
// window.onresize = function () {
//     myLayout.updateSize();
// };

ReactDOM.render(<ViewComponent />, document.getElementById('view'));