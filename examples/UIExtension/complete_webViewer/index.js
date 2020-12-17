import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import './index.css';

var PDFUI = UIExtension.PDFUI;
var Events = UIExtension.PDFViewCtrl.Events;
var pdfui = new PDFUI({
    viewerOptions: {
        libPath: '../../../lib',
        jr: {
            readyWorker: readyWorker,
        }
    },
    renderTo: '#pdf-ui',
    appearance: UIExtension.appearances.adaptive,
    fragments: [],
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile
        ? '/lib/uix-addons/allInOne.mobile.js'
        : '/lib/uix-addons/allInOne.js',
});

pdfui.addUIEventListener('fullscreenchange', function (isFullscreen) {
    if (isFullscreen) {
        document.body.classList.add('fv__pdfui-fullscreen-mode');
    } else {
        document.body.classList.remove('fv__pdfui-fullscreen-mode');
    }
});

function openLoadingLayer() {
    return pdfui.loading();
}
var loadingComponentPromise = openLoadingLayer();
var openFileError = null;
var passwordErrorCode = PDFViewCtrl.PDF.constant.Error_Code.password;
function startLoading() {
    if (openFileError && openFileError.error === passwordErrorCode) return;
    if (loadingComponentPromise) {
        loadingComponentPromise = loadingComponentPromise
            .then(function (component) {
                component.close();
            })
            .then(openLoadingLayer);
    } else {
        loadingComponentPromise = openLoadingLayer();
    }
}
pdfui.addViewerEventListener(Events.beforeOpenFile, startLoading);
pdfui.addViewerEventListener(Events.openFileSuccess, function () {
    openFileError = null;
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});
pdfui.addViewerEventListener(Events.openFileFailed, function (data) {
    openFileError = data;
    if (openFileError && openFileError.error === passwordErrorCode) return;
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});

pdfui.addViewerEventListener(Events.startConvert, startLoading);
pdfui.addViewerEventListener(Events.finishConvert, function () {
    loadingComponentPromise.then(function (component) {
        component.close();
    });
});

pdfui.openPDFByHttpRangeRequest(
    {
        range: {
            url: '/assets/FoxitPDFSDKforWeb_DemoGuide.pdf',
        },
    },
    { fileName: 'FoxitPDFSDKforWeb_DemoGuide.pdf' }
);

window.addEventListener(UIExtension.PDFViewCtrl.DeviceInfo.isDesktop ? 'resize' : 'orientationchange', function (e) {
    pdfui.redraw().catch(function (err) {
        console.log(err);
    });
});

//signature handlers
var requestData = function (type, url, responseType, body) {
    return new Promise(function (res, rej) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(type, url);

        xmlHttp.responseType = responseType || 'arraybuffer';
        var formData = new FormData();
        if (body) {
            for (var key in body) {
                if (body[key] instanceof Blob) {
                    formData.append(key, body[key], key);
                } else {
                    formData.append(key, body[key]);
                }
            }
        }
        xmlHttp.onloadend = function (e) {
            var status = xmlHttp.status;
            if ((status >= 200 && status < 300) || status === 304) {
                res(xmlHttp.response);
            } else {
                rej(new Error('Sign server is not available.'));
            }
        };

        xmlHttp.send(body ? formData : null);
    });
};

pdfui.setVerifyHandler(function (signatureField, plainBuffer, signedData) {
    return requestData('post', location.protocol + '://webviewer-demo.foxitsoftware.com/signature/verify', 'text', {
        filter: signatureField.getFilter(),
        subfilter: signatureField.getSubfilter(),
        signer: signatureField.getSigner(),
        plainContent: new Blob([plainBuffer]),
        signedData: new Blob([signedData]),
    });
});
pdfui.registerSignHandler({
    filter: 'Adobe.PPKLite',
    subfilter: 'adbe.pkcs7.sha1',
    flag: 0x100,
    distinguishName: 'e=support@foxitsoftware.cn',
    location: 'FZ',
    reason: 'Test',
    signer: 'web sdk',
    showTime: true,
    sign: function (setting, buffer) {
        return requestData('post', location.protocol + '://webviewer-demo.foxitsoftware.com/signature/digest_and_sign', 'arraybuffer', {
            plain: new Blob([buffer]),
        });
    },
});
window.pdfui = pdfui;