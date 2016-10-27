/*! parts v0.0.1 | (c) 2016  |  Available via MIT license */
!function(a){"use strict";var b=a?global:window,c=Array.prototype,d=Object.prototype,e=function(a,b){var c=0;return a.replace(/[$%](\d+|s)/g,function(a){var d;return"s"===a.charAt(1)?(d=b[c],c+=1):d=b[Number(a.substr(1))-1],"$"===a.charAt(0)?K(d):String(d)})},f=function(){return(new Date).getTime()},g=function(a){return function(b){return d.toString.call(b)==="[object "+a+"]"}},h=function(a){return RegExp.prototype.toString.call(a)},i=g("Array"),j=g("Function"),k=g("Date"),l=g("RegExp"),m=function(a){return null!==a&&("object"==typeof a||j(a))},n=function(a){return a===!0||a===!1},o=function(a){return"number"==typeof a&&!isNaN(a)},p=function(a){return"string"==typeof a},q=function(a){return"number"==typeof a&&isNaN(a)},r=function(a){return function(b){return b===a}},s=function(a){return v(function(b){return!a.apply(this,b)})},t=function(a,b,c,d){if(a===b)return!0;if(!m(a)||!m(b))return!1;var e=A(c,r(a));return void 0!==e&&e===A(d,r(b))?!0:(c.push(a),d.push(b),i(a)&&i(b)?a.length===b.length&&F(a,function(a,e){return t(a,b[e],c,d)}):l(a)&&l(b)?h(a)===h(b):k(a)&&k(b)?a.getTime()===b.getTime():F(a,function(a,e){return t(a,b[e],c,d)})&&F(b,function(b,e){return t(a[e],b,c,d)}))},u=function(a){return function(){return a}},v=function(a){return function(){return a.call(this,E(arguments))}},w=u(),x=a?function(a){setImmediate(a)}:function(a){setTimeout(a,0)},y=function(a,b){return d.hasOwnProperty.call(a,b)},z=function(a,b,c){c?C(c,function(c){y(b,c)&&(a[c]=b[c])}):C(b,function(b,c){a[c]=b})},A=function(a,b){var c,d=null;if(i(a)){for(d=0,c=a.length;c>d;d+=1)if(b(a[d],d))return d}else{if(p(a))return A(a.split(""),b);for(d in a)if(y(a,d)&&b(a[d],d))return d}},B=function(a,b){var c=A(a,b||u(!0));return void 0!==c?a[c]:void 0},C=function(a,b){A(a,function(a,c){return b(a,c),!1})},D=function(a,b){var c=[];return C(a,function(a,d){c.push(b(a,d))}),c},E=function(){var a=c.slice.call(arguments);return c.slice.apply(a.shift(),a)},F=function(a,b){return void 0===A(a,function(a,c){return!b(a,c)})},G=function(a,b){return!F(a,s(b))},H={string:p,number:o,array:i,date:k,regexp:l,"function":j,object:m,"boolean":n},I=v(function(a){var b={};return a=D(a,function(a){return j(a)?{hints:[],method:a}:a}),C(a,function(a){var c=a.method.length;c in b?b[c].push(a):b[c]=[a]}),b.d=a[a.length-1],v(function(a){var c;return a.length in b&&(c=B(b[a.length],function(b){var c=F(b.hints,function(b,c){var d=a[c];if(j(b))return d instanceof b;if(b in H)return H[b](d);if(-1!==A(["mixed","*"],b))return!0;throw new TypeError("Invalid type")});return c})),(c||b.d).method.apply(this,a)})}),J=function(a){return v(function(b){return b.unshift(this),a.apply(this,b)})},K=function(){var a=function(b,c,d,e,f){var g,h,s=e;if(d=c?d+"  ":"",m(b))return g=A(f,r(b)),void 0!==g?"<"+g+":ref>":(f.push(b),k(b)?"<"+e+":d: "+b.toString()+">":l(b)?"<"+e+":r: "+b.toString()+">":j(b)?"<"+e+":f: "+b.toString()+">":i(b)?(h=D(b,function(b){return m(b)&&(s+=1),a(b,c,d,s,f)}),0===h.length?"<"+e+":a: []>":"<"+e+":a: ["+(c?"\n"+d:"")+h.join(c?",\n"+d:", ")+(c?"\n"+d.substr(0,d.length-2):"")+"]>"):(h=D(b,function(b,e){return m(b)&&(s+=1),JSON.stringify(e)+": "+a(b,c,d,s,f)}),0===h.length?"<"+e+":o: {}>":"<"+e+":o: {"+(c?"\n"+d:"")+h.join(c?",\n"+d:"")+(c?"\n"+d.substr(0,d.length-2):"")+"}>"));switch(!0){case n(b):return"<b: "+b+">";case o(b):return"<n: "+b.toString()+">";case p(b):return"<s: "+JSON.stringify(b)+">";case q(b):return"<nan>";case null===b:return"<null>";case void 0===b:return"<undefined>";default:return"<unknown: "+b.toString()+">"}};return function(b,c){return a(b,arguments.length>1?c:!0,"",0,[])}}(),L={constant:u,k:w,args:v,work:x,hop:y,merge:z,indexOf:A,first:B,forEach:C,map:D,slice:E,overload:I,that:J,equals:function(a,b){return t(a,b,[],[])},every:F,some:G,isArray:i,isFunction:j,isObject:m,isDate:k,isRegExp:l,isNaN:q,isBoolean:n,isNumber:o,isString:p,now:f,sameAs:r,negate:s,make:function(){var a={},b=function(c,d){return a[c]=d,b};return b.build=u(a),b},dump:K,format:e,applyNew:function(a,b){var c=function(){a.apply(this,b)};return c.prototype=a.prototype,new c},silence:function(a){try{return a()}catch(b){}}};a?module.exports=L:b.parts=L}("undefined"!=typeof exports&&global.exports!==exports);