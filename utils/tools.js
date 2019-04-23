class Tools{
    constructor(){}

    ab2hex(buffer){
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    ab2str(buffer){
        var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
        var str = ''
        for (var i = 0; i < arr.length; i++) {
            str += String.fromCharCode(arr[i])
        }
        return str
    }

    str2ab(str){
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i)
        }
        return buf
    }

    str2hex(str){
　　　　 var val = "";
　　　　 for(var i = 0; i < str.length; i++){
　　　　　　　if (val == "") {
                val = str.charCodeAt(i).toString(16);
            } else {
                val += "," + str.charCodeAt(i).toString(16);
            }
　　　　}
　　　　return val;
　　}

    hex2str(str) {
        var val = "";
        var arr = str.split(",");
        for (var i =0; i < arr.length; i++) {
            val += arr[i].fromCharCode(i);
        }
        return val;
    }

    versionCompare(ver1, ver2){
        var version1pre = parseFloat(ver1)
        var version2pre = parseFloat(ver2)
        var version1next = parseInt(ver1.replace(version1pre + ".", ""))
        var version2next = parseInt(ver2.replace(version2pre + ".", ""))
        if (version1pre > version2pre)
            return true
        else if (version1pre < version2pre)
            return false
        else {
            if (version1next > version2next)
                return true
            else
                return false
        }
    }

    cmdHexStr(cmd){
        return new Uint8Array(cmd.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16)
        }))
    }

    cmdOctStr(cmd){
        return new Uint8Array(cmd.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 10)
        }))
    }

    currentDate(){ 
        var now = new Date();

        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
       
        var clock = year;
       
        if(month < 10)
            clock += "0";
       
        clock += month;
       
        if(day < 10)
            clock += "0";
           
        clock += day;
        return(clock); 
    }

    currentTime(){ 
        var now = new Date();

        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
       
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
       
        var clock = year;
       
        if(month < 10)
            clock += "0";
       
        clock += month;
       
        if(day < 10)
            clock += "0";
           
        clock += day;
       
        if(hh < 10)
            clock += "0";
           
        clock += hh;
        if (mm < 10) clock += '0'; 
        clock += mm; 
        return(clock); 
    }

    currentLockTime(){ 
        var now = new Date();

        var year = now.getFullYear().toString().slice(2,4);       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
       
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();          //分
       
        var clock = year;
       
        if(month < 10)
            clock += "0";
        clock += month;
       
        if(day < 10)
            clock += "0";
        clock += day;
       
        if(hh < 10)
            clock += "0";
        clock += hh;

        if (mm < 10)
            clock += '0'; 
        clock += mm;

        if(ss < 10)
            clock += "0";
        clock += ss;

        return(clock); 
    }

    mathRand(length){ 
        var num=""; 
        for(var i=0; i<length; i++) { 
            num += Math.floor(Math.random()*10); 
        } 
        return num;
    }

    string_hex2int(hex) {
        var len = hex.length, a = new Array(len), code;
        for (var i = 0; i < len; i++) {
            code = hex.charCodeAt(i);
            if (48<=code && code < 58) {
                code -= 48;
            } else {
                code = (code & 0xdf) - 65 + 10;
            }
            a[i] = code;
        }
        
        return a.reduce(function(acc, c) {
            acc = 16 * acc + c;
            return acc;
        }, 0);
    }

    sleep(numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
            return;
        }
    }

}

export default Tools;