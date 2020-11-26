const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa-cors');
const fs = require('fs');
const app = new Koa();
var process = require('child_process');

const koabody=require('koa-body')


const router = Router();
/**
payloads:
    {
        plain:(binary)
    }
returns:
    signedData：arrayBuffer
 */
router.post('/digest_and_sign',koabody({multipart:true}),async (ctx)=>{
    fs.copyFileSync(ctx.request.files.plain.path,".\\temp\\plain");
    process.execSync(".\\bin\\pkcs7.exe digest .\\temp\\plain .\\temp\\sha1");
    process.execSync(".\\bin\\pkcs7.exe sign .\\bin\\foxit_all.pfx 123456 .\\temp\\sha1 .\\temp\\signedData");
    ctx.body = fs.createReadStream(".\\temp\\signedData");
    return;
});

/**
 * 
payloads:
    {
        filter:(string),
        subfilter:(string),
        signer:(string),
        plainContent:(binary)
        signedData:(binary)
    }
returns:
    signatureState:number
 */
router.post('/verify',koabody({multipart:true}),async (ctx)=>{

    let {filter,subfilter,signer} = ctx.request.body

    fs.copyFileSync(ctx.request.files.plainContent.path,".\\temp\\plainBuffer");
    fs.copyFileSync(ctx.request.files.signedData.path,".\\temp\\signedData");

    
    process.execSync(".\\bin\\pkcs7.exe digest .\\temp\\plainBuffer .\\temp\\digest");
    process.execSync(".\\bin\\pkcs7.exe verify .\\temp\\signedData .\\temp\\digest .\\temp\\output");

    ctx.body = fs.createReadStream(".\\temp\\output");
    /*
    return a digital string. one or a combination of below values. 
    StateVerifyChange:0x00000080
    StateVerifyIncredible:0x00000100
    StateVerifyNoChange:0x00000400
    StateVerifyIssueValid:0x00001000
    StateVerifyIssueUnknown:0x00002000
    StateVerifyIssueRevoke:0x00004000
    StateVerifyIssueExpire:0x00008000
    StateVerifyIssueUncheck:0x00010000
    StateVerifyIssueCurrent:0x00020000
    StateVerifyTimestampNone:0x00040000
    StateVerifyTimestampDoc:0x00080000
    StateVerifyTimestampValid:0x00100000
    StateVerifyTimestampInvalid:0x00200000
    StateVerifyTimestampExpire:0x00400000
    StateVerifyTimestampIssueUnknown:0x00800000
    StateVerifyTimestampIssueValid:0x01000000
    StateVerifyTimestampTimeBefore:0x02000000
    */
});

app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

const port = 7777; 
app.listen(port, function() {
    console.log(`file downloading server is listening on port ${port}`);
});