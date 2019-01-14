const TabGroup = require('electron-tabs')
const path = require('path')

// window.$ = window.jQuery = require('jquery');
// const TabGroup = require("../index");

let tabGroup = new TabGroup({
    newTab: {
        title: 'New Tab',
        src: 'file://' + __dirname + '/editor.html',
        webviewAttributes: {
            'nodeintegration': true
        },
        icon: 'fa fa-home',
        visible: true,
        closable: false,
        active: true,
        ready: tab => {
            // Open dev tools for webview
            let webview = tab.webview;
            if (!!webview) {
                webview.addEventListener('dom-ready', () => {
                    webview.openDevTools();
                })
            }
        }
    }
});

let tab = tabGroup.addTab({
    title: 'Home',
    src: 'file://' + __dirname + '/editor.html',
    webviewAttributes: {
        'nodeintegration': true
    },
    icon: 'fa fa-home',
    visible: true,
    closable: false,
    active: true,
    ready: tab => {
        // Open dev tools for webview
        let webview = tab.webview;
        if (!!webview) {
            webview.addEventListener('dom-ready', () => {
                webview.openDevTools();
            })
        }
    }
});