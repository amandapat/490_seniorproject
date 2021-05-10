let color = '#3aa757';



chrome.tabs.onUpdated.addListener(function func(tabId, changeInfo, tab) {
    if (tabId == tab.id && changeInfo.status == 'complete') {
        savePage(tabId, tab);
    }
});

// chrome.tabs.executeScript -- this messages the content back to the extension 
function savePage(tabId, tab) {
    chrome.pageCapture.saveAsMHTML({
        tabId: tabId
    }, function(blob) {
        blob.text().then((text) => {
            var url = tab.url
            sendHTML(url, text)
        });
    });
}

function sendHTML(url, mhtml) {

    mhtml=mhtml.substring(mhtml.indexOf('<body'),mhtml.indexOf('</body>')+7);
    //remove remove trailing white space, remove hard line breaks preceded by `=` and decode escape sequences
    mhtml=mhtml.replace(/[\t\x20]$/gm, '').replace(/=(?:\r\n?|\n|$)/g, '').replace(/=([a-fA-F0-9]{2})/g, function($0, $1) {
        var codePoint = parseInt($1, 16);
        return String.fromCharCode(codePoint);
    });
    // console.log("does this work")
    // mhtml = mhtml.replace(/"/g, '');
    // mhtml = mhtml.replace(/'/g, '');
    // mhtml = mhtml.replace(/\//g, '');
    // mhtml = mhtml.replace(/\\/g, '');
    // mhtml = mhtml.replace(/;/g, '');
    // mhtml = mhtml.replace(/-/g, ' ');
    // mhtml = mhtml.replace(/_/g, '');
    // mhtml = mhtml.replace(/!/g, '.');
    // mhtml = mhtml.replace(/</g, '');
    // mhtml = mhtml.replace(/>/g, '');
    // mhtml = mhtml.replace(/\n/g, '');
    // console.log(mhtml)
    // console.log(mhtml[344])
    // console.log(mhtml[345])
    // console.log(mhtml[346])
    var jsonString = "{\"site\" : [{\"url\": \"" + url + "\", " + "\"body\": \"" + mhtml + "\"}]}"
    // var json = JSON.parse(jsonString)
    
    // const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // const Http = new XMLHttpRequest();
    // const Http = GetXmlHttpObject();
    // const url2='http://localhost:5000/endpoint2/';
    // Http.open("POST", url2, true);
    // Http.setRequestHeader("Content-Type", "application/json");
    // Http.setRequestHeader("Access-Control-Allow-Origin", "*");
    // Http.send(JSON.stringify(json));
    // Http.onreadystatechange = (e) => {
    //     var data = Http.responseText
    //     console.log(data)
    // }
    chrome.runtime.sendMessage({greeting: jsonString}, function(response) {
        console.log(response.farewell);
      });

}


// //https://stackoverflow.com/questions/15874535/xmlhttprequest-is-not-defined-in-a-chrome-extension-options-page
// function GetXmlHttpObject()
// { 
//     var objXMLHttp=null;
//     if (window.XMLHttpRequest)
//     {
//         objXMLHttp=new XMLHttpRequest();
//     }
//     else if (window.ActiveXObject)
//     {
//         objXMLHttp=new ActiveXObject("Microsoft.XMLHTTP");
//     }
//     return objXMLHttp;
// }