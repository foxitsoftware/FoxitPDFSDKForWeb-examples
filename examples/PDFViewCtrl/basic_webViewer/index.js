import * as PDFViewCtrl from 'PDFViewCtrl';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl.css';


var PDFViewer = PDFViewCtrl.PDFViewer;
var pdfViewer = new PDFViewer({
    libPath: '/lib',
    jr: {
        licenseSN: licenseSN,
        licenseKey: licenseKey,
        fontPath: 'https://webpdf.foxitsoftware.com/webfonts/',
        tileSize: 300,
    },
    customs: {
        closeDocBefore: function () {
            return confirm('Close the current document?');
        },
        PageCustomRender: (function () {
            function CustomPageCustomRender(eCustom, pdfPageRender) {
                this.eCustom = eCustom;
                this.pdfPageRender = pdfPageRender;
            }
            CustomPageCustomRender.prototype.render = function () {
                var self = this;
                return self.pdfPageRender.getPDFPage().then(function (page) {
                    if (page.getIndex() > 3) {
                        self.eCustom.innerHTML = 'You are not authorized to view this page.';
                        return false;
                    }
                });
            };
            CustomPageCustomRender.prototype.destroy = function () {
                this.eCustom.innerHTML = '';
            };
            return CustomPageCustomRender;
        })(),
    },
});
window.PDFViewCtrl = PDFViewCtrl;
const { EditGraphicsAddon } = require('@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl/addon/EditGraphicsAddonModule');

new EditGraphicsAddon(pdfViewer).init();
pdfViewer.init('#pdf-viewer');

document.getElementById('file').onchange = function (e) {
    if (!this.value) {
        return;
    }
    var pdf, fdf;
    for (var i = e.target.files.length; i--; ) {
        var file = e.target.files[i];
        var filename = file.name;
        if (/\.pdf$/i.test(filename)) {
            pdf = file;
        } else if (/\.(x)?fdf$/i.test(filename)) {
            fdf = file;
        }
    }
    pdfViewer.openPDFByFile(pdf, {
        password: '',
        fdf: {
            file: fdf,
        },
    });
    this.value = '';
};
var scale = 1;
document.getElementById('plus').onclick = function () {
    scale += 0.25;
    pdfViewer.zoomTo(scale).catch(function () {});
};
document.getElementById('sub').onclick = function () {
    scale -= 0.25;
    pdfViewer.zoomTo(scale).catch(function () {});
};
